const OUT_W = 900;
const OUT_H = 1200; // 3:4, matches the app's photo aspect ratio

const $ = (id) => document.getElementById(id);

// Shows the crop sheet for `file`, lets the user pan/zoom within a fixed
// 3:4 frame, and resolves with the cropped JPEG blob (or null if cancelled).
export function openCropper(file) {
  return new Promise((resolve) => {
    const overlay = $('cropOverlay');
    const frame = $('cropFrame');
    const img = $('cropImg');
    const zoom = $('cropZoom');
    const cancelBtn = $('cropCancelBtn');
    const confirmBtn = $('cropConfirmBtn');

    const reader = new FileReader();
    reader.onload = (ev) => {
      img.onload = () => {
        overlay.hidden = false;
        const rect = frame.getBoundingClientRect();
        // coverScale fills the frame with no gaps (may crop the image);
        // containScale shows the whole image, letterboxed if needed.
        // Zooming out past coverScale down to containScale trades crop
        // for visible background, for images that don't match the 3:4 frame.
        const coverScale = Math.max(rect.width / img.naturalWidth, rect.height / img.naturalHeight);
        const containScale = Math.min(rect.width / img.naturalWidth, rect.height / img.naturalHeight);
        const minScale = containScale;
        const maxScale = coverScale * 3;
        let scale = coverScale;
        let tx = (rect.width - img.naturalWidth * scale) / 2;
        let ty = (rect.height - img.naturalHeight * scale) / 2;

        function clampAxis(pos, imgSize, frameSize) {
          const lo = Math.min(0, frameSize - imgSize);
          const hi = Math.max(0, frameSize - imgSize);
          return Math.min(hi, Math.max(lo, pos));
        }

        function apply() {
          const w = img.naturalWidth * scale, h = img.naturalHeight * scale;
          tx = clampAxis(tx, w, rect.width);
          ty = clampAxis(ty, h, rect.height);
          img.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
        }

        zoom.value = String(((scale - minScale) / (maxScale - minScale)) * 100);
        zoom.oninput = () => {
          const cx = rect.width / 2, cy = rect.height / 2;
          const imgCx = (cx - tx) / scale, imgCy = (cy - ty) / scale;
          scale = minScale + (Number(zoom.value) / 100) * (maxScale - minScale);
          tx = cx - imgCx * scale;
          ty = cy - imgCy * scale;
          apply();
        };

        let activePointerId = null, lastX = 0, lastY = 0;
        const onDown = (e) => {
          if (activePointerId !== null) return; // a second finger (pinch) must not join the drag
          activePointerId = e.pointerId;
          lastX = e.clientX; lastY = e.clientY;
        };
        const onMove = (e) => {
          if (e.pointerId !== activePointerId) return;
          tx += e.clientX - lastX;
          ty += e.clientY - lastY;
          lastX = e.clientX; lastY = e.clientY;
          apply();
        };
        const onUp = (e) => {
          if (e.pointerId !== activePointerId) return;
          activePointerId = null;
        };

        frame.addEventListener('pointerdown', onDown);
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
        window.addEventListener('pointercancel', onUp);

        apply();

        function cleanup() {
          overlay.hidden = true;
          frame.removeEventListener('pointerdown', onDown);
          window.removeEventListener('pointermove', onMove);
          window.removeEventListener('pointerup', onUp);
          window.removeEventListener('pointercancel', onUp);
          cancelBtn.onclick = null;
          confirmBtn.onclick = null;
        }

        cancelBtn.onclick = () => { cleanup(); resolve(null); };
        confirmBtn.onclick = () => {
          const k = OUT_W / rect.width;
          const canvas = document.createElement('canvas');
          canvas.width = OUT_W;
          canvas.height = OUT_H;
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = '#ffffff'; // fills any letterboxing left by zooming out past cover-fit
          ctx.fillRect(0, 0, OUT_W, OUT_H);
          ctx.drawImage(
            img,
            tx * k, ty * k,
            img.naturalWidth * scale * k, img.naturalHeight * scale * k
          );
          canvas.toBlob((blob) => { cleanup(); resolve(blob); }, 'image/jpeg', 0.72);
        };
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });
}
