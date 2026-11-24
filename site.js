// Jump-menu dropdowns and image lightbox for the Projects page.
(function () {
  // ----- Dropdowns -----
  const dropdowns = Array.from(document.querySelectorAll('.dropdown'));
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  function setOpen(dd, open) {
    const btn = dd.querySelector('.dropdown-toggle');
    dd.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
  }
  function closeAll(except) {
    dropdowns.forEach(dd => { if (dd !== except) setOpen(dd, false); });
  }

  dropdowns.forEach(dd => {
    const btn = dd.querySelector('.dropdown-toggle');
    const links = Array.from(dd.querySelectorAll('.dropdown-menu a'));

    btn.addEventListener('click', () => {
      // If hover just opened it, a click keeps it open instead of toggling it shut.
      const justHovered = dd.dataset.hoverOpened && Date.now() - Number(dd.dataset.hoverOpened) < 600;
      const open = justHovered ? true : !dd.classList.contains('open');
      closeAll(dd);
      setOpen(dd, open);
      if (open && !canHover) links[0] && links[0].focus({ preventScroll: true });
    });
    btn.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown') { e.preventDefault(); closeAll(dd); setOpen(dd, true); links[0].focus(); }
    });

    if (canHover) {
      let t;
      dd.addEventListener('mouseenter', () => {
        clearTimeout(t); closeAll(dd);
        if (!dd.classList.contains('open')) dd.dataset.hoverOpened = String(Date.now());
        setOpen(dd, true);
      });
      dd.addEventListener('mouseleave', () => { t = setTimeout(() => setOpen(dd, false), 150); });
    }

    links.forEach((a, i) => {
      a.addEventListener('keydown', e => {
        if (e.key === 'ArrowDown') { e.preventDefault(); (links[i + 1] || links[0]).focus(); }
        if (e.key === 'ArrowUp') { e.preventDefault(); (links[i - 1] || links[links.length - 1]).focus(); }
      });
      a.addEventListener('click', e => {
        const target = document.querySelector(a.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        setOpen(dd, false);
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.replaceState(null, '', a.getAttribute('href'));
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      });
    });

    // Close when focus leaves the dropdown (keyboard users tabbing away)
    dd.addEventListener('focusout', e => {
      if (!dd.contains(e.relatedTarget)) setOpen(dd, false);
    });
  });

  document.addEventListener('click', e => {
    if (!e.target.closest('.dropdown')) closeAll();
  });
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    const open = dropdowns.find(dd => dd.classList.contains('open'));
    if (open) { setOpen(open, false); open.querySelector('.dropdown-toggle').focus(); }
  });

  // ----- Lightbox -----
  const box = document.getElementById('lightbox');
  if (!box || typeof box.showModal !== 'function') return; // links still open the image directly
  const img = box.querySelector('img');
  const cap = box.querySelector('.lightbox-caption');

  document.querySelectorAll('a[data-lightbox]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const thumb = a.querySelector('img');
      img.src = a.getAttribute('href');
      img.alt = thumb ? thumb.alt : '';
      cap.textContent = a.dataset.caption || '';
      box.showModal();
    });
  });
  box.querySelector('.lightbox-close').addEventListener('click', () => box.close());
  box.addEventListener('click', e => { if (e.target === box) box.close(); });
})();
