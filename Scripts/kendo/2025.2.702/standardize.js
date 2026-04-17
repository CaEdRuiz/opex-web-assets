$(document).ready(function () {
    // Selecciona todos los botones del toolbar dentro del grid
    $(".k-grid .k-toolbar a.k-button, .k-grid .k-toolbar button.k-button").each(function () {

        const $btn = $(this);
        const requiredClasses = [
            "k-button-md",
            "k-rounded-md",
            "k-button-solid",
            "k-button-solid-base",
            "k-toolbar-button"
        ];

        requiredClasses.forEach(function (cls) {
            if (!$btn.hasClass(cls)) {
                $btn.addClass(cls);
            }
        });
    });

    // Estandarizar <textarea> que solo tengan k-textbox
    $("textarea.k-textbox").each(function () {
        const $textarea = $(this);
        const allClasses = $textarea.attr("class").split(/\s+/);

        // Solo actuar si k-textbox es la única clase
        if (allClasses.length === 1 && allClasses[0] === "k-textbox") {
            const requiredClasses = [
                "k-input",
                "k-textarea",
                "k-input-solid",
                "k-input-md",
                "k-rounded-md"
            ];

            requiredClasses.forEach(function (cls) {
                if (!$textarea.hasClass(cls)) {
                    $textarea.addClass(cls);
                }
            });
        }
    });

});

// (function () {
//   const sel = 'a.k-grid-delete:not(.k-grid-remove-command),button.k-grid-delete:not(.k-grid-remove-command)';

//   function apply(root = document) {
//     root.querySelectorAll(sel).forEach(el => el.classList.add('k-grid-remove-command'));

//     // 🔹 Fix k-state-disabled
//     root.querySelectorAll('.k-state-disabled').forEach(el => {
//         if (!el.classList.contains("k-disabled")) {
//             el.classList.add("k-disabled");
//         }
//     });
//   }

//   function startObserver() {
//     // Asegura un Node válido para observar
//     const target = document.body || document.documentElement;
//     if (!target) {
//       // Si todavía no hay <body>, reintenta en breve
//       setTimeout(startObserver, 50);
//       return;
//     }

//     // Primera pasada
//     apply();

//     const obs = new MutationObserver(muts => {
//       for (const m of muts) {
//         for (const n of m.addedNodes) {
//           if (!(n instanceof HTMLElement)) continue;
//           if (n.matches && n.matches(sel)) {
//             n.classList.add('k-grid-remove-command');
//           } else {
//             apply(n); // busca descendientes que cumplan
//           }
//         }
//       }
//     });

//     obs.observe(target, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
//   }

//   // Arranca cuando el DOM esté listo; si ya está, arranca ya
//   if (document.readyState === 'loading') {
//     document.addEventListener('DOMContentLoaded', startObserver);
//   } else {
//     startObserver();
//   }

// })();

(function () {
  const sel = 'a.k-grid-delete:not(.k-grid-remove-command),button.k-grid-delete:not(.k-grid-remove-command)';

  function apply(root = document) {
    // 🔹 Fix botones delete
    root.querySelectorAll(sel).forEach(el => el.classList.add('k-grid-remove-command'));

    // 🔹 Fix k-state-disabled -> k-disabled
    root.querySelectorAll('.k-state-disabled').forEach(el => {
      if (!el.classList.contains("k-disabled")) {
        el.classList.add("k-disabled");
      }
    });

    // 🔹 Si tiene k-disabled pero ya no tiene k-state-disabled -> quitarla
    root.querySelectorAll('.k-disabled').forEach(el => {
      if (!el.classList.contains("k-state-disabled")) {
        el.classList.remove("k-disabled");
      }
    });
  }

  function startObserver() {
    const target = document.body || document.documentElement;
    if (!target) {
      setTimeout(startObserver, 50);
      return;
    }

    // Primera pasada
    apply();

    const obs = new MutationObserver(muts => {
      for (const m of muts) {
        // 🔹 Si cambió el atributo class de un nodo existente
        if (m.type === "attributes" && m.attributeName === "class") {
          if (m.target.classList.contains("k-state-disabled")) {
            m.target.classList.add("k-disabled");
          } else {
            m.target.classList.remove("k-disabled");
          }
        }

        // 🔹 Si se agregaron nodos nuevos
        for (const n of m.addedNodes) {
          if (!(n instanceof HTMLElement)) continue;
          if (n.matches && n.matches(sel)) {
            n.classList.add('k-grid-remove-command');
          } else {
            apply(n); // busca descendientes que cumplan
          }
        }
      }
    });

    obs.observe(target, { 
      childList: true, 
      subtree: true, 
      attributes: true, 
      attributeFilter: ["class"] 
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startObserver);
  } else {
    startObserver();
  }

})();
