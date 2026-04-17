    var sourceAPiUrl = "https://apps.bae.gym/BaseDatos/OpEx/";
    function initializePet({ name = "pet 🐾", speed = 12000, initialPosition = "derecha" }) {
        let petConfig = {
            name: name,
            speed: speed,
            initialPosition: initialPosition
        };

        /*Inyecta estilos para el pet*/
        if (!document.getElementById("pet-style")) {
            const style = document.createElement("style");
            style.id = "pet-style";
            style.textContent = `
                    .pet-gif-container {
                        position: fixed;
                        bottom: 60px;
                        z-index: 9999;
                        width: 100px;
                        height: auto;
                        cursor: pointer;
                        display: none;
                    }

                    .pet-gif-container img {
                        width: 100%;
                        height: auto;
                    }

                    .pet-tooltip {
                        position: absolute;
                        background: rgba(0, 0, 0, 0.75);
                        color: white;
                        padding: 4px 8px;
                        font-size: 12px;
                        border-radius: 5px;
                        white-space: nowrap;
                        pointer-events: none;
                        opacity: 0;
                        transition: opacity 0.3s ease-in-out;
                    }

                    .pet-name-tooltip {
                        bottom: 100%;
                        left: 50%;
                        transform: translateX(-50%);
                        margin-bottom: 8px;
                    }

                    .pet-click-tooltip.left {
                        top: 50%;
                        right: 100%;
                        transform: translateY(-50%);
                        margin-right: 0px;
                    }

                    .pet-click-tooltip.right {
                        top: 50%;
                        left: 100%;
                        transform: translateY(-50%);
                        margin-left: 0px;
                    }

                    .pet-container-hover .pet-name-tooltip {
                        opacity: 1;
                    }

                    .pet-click-tooltip.show {
                        opacity: 1;
                        transition: opacity 0.3s ease-in-out;
                    }

                    .pet-click-tooltip.hide {
                        opacity: 0;
                        transition: opacity 1s ease-in-out;
                    }
            `;
            document.head.appendChild(style);
        }

        // 🧱 Crear contenedor HTML de la mascota
        const petContainer = document.createElement("div");
        petContainer.className = "pet-gif-container";
        petContainer.id = "pet";
        petContainer.innerHTML = `
            <div class="pet-tooltip pet-name-tooltip" id="pet-name-tooltip"></div>
            <div class="pet-tooltip pet-click-tooltip" id="pet-click-tooltip">¡Click para hacer shu! shu!</div>
            <img id="pet-img" src="`+ sourceAPiUrl+`/api/opexpet/image?position=sentado" alt="pet animado">
        `;
        document.body.appendChild(petContainer);

        const pet = document.getElementById("pet");
        let petImg = document.getElementById("pet-img");
        const tooltipClick = document.getElementById("pet-click-tooltip");
        const tooltipName = document.getElementById("pet-name-tooltip");

        tooltipName.textContent = name;

        let isOnRight = initialPosition === "derecha";
        let isWalking = false;
        let hideTooltipTimeout, hideNameTimeout;
        const stepSize = 3;
        const desiredDuration = speed;

        // 📍 Coloca el pet en su posición inicial
        pet.style.visibility = "hidden";
        pet.style.display = "block";

        const petWidth = pet.offsetWidth;
        pet.style.left = isOnRight
            ? (window.innerWidth - petWidth - 20) + "px"
            : "60px";

        pet.style.visibility = "visible";

        // 🐾 Tooltip de nombre y movimiento
        pet.addEventListener("mouseenter", () => {
            pet.classList.add("pet-container-hover");

            if (isWalking) return;

            tooltipClick.classList.remove("left", "right");
            tooltipClick.classList.add(isOnRight ? "left" : "right");

            tooltipClick.classList.add("show");
            tooltipClick.classList.remove("hide");

            clearTimeout(hideTooltipTimeout);
            hideTooltipTimeout = setTimeout(() => {
                tooltipClick.classList.remove("show");
                tooltipClick.classList.add("hide");
            }, 3000);
        });

        pet.addEventListener("mouseleave", () => {
            tooltipClick.classList.remove("show");
            tooltipClick.classList.add("hide");

            clearTimeout(hideNameTimeout);
            hideNameTimeout = setTimeout(() => {
                pet.classList.remove("pet-container-hover");
            }, 3000);

        });

        pet.addEventListener("click", () => {
            if (isWalking) return;
            isWalking = true;
            const timestamp = "t=" + new Date().getTime();
            const gifSrc = isOnRight
                ? sourceAPiUrl+"/api/virtualpet/image?position=izquierda"
                : sourceAPiUrl +"/api/virtualpet/image?position=derecha";

            // 🛠 Agrega el timestamp correctamente según si ya tiene ?
            const newImg = petImg.cloneNode();
            newImg.src = gifSrc + "&" + timestamp; // ← usar & en lugar de ? nuevamente

            newImg.id = "pet-img";
            petImg.parentNode.replaceChild(newImg, petImg);
            petImg = newImg;

            pet.style.transform = "scale(0.71)";

            let currentLeft = parseInt(window.getComputedStyle(pet).left, 10) || 0;
            const leftLimit = 60;
            const rightLimit = window.innerWidth - pet.offsetWidth - 20;
            const targetLeft = isOnRight ? leftLimit : rightLimit;

            const distance = targetLeft - currentLeft;
            const direction = distance > 0 ? 1 : -1;
            const totalDistance = Math.abs(distance);
            const steps = Math.ceil(totalDistance / stepSize);
            const intervalMs = desiredDuration / steps;

            let position = currentLeft;

            const interval = setInterval(() => {
                position += stepSize * direction;
                pet.style.left = position + "px";

                const hasArrived =
                    (direction === 1 && position >= targetLeft) ||
                    (direction === -1 && position <= targetLeft);

                if (hasArrived) {
                    clearInterval(interval);

                    const sitImg = petImg.cloneNode();
                    sitImg.src = sourceAPiUrl +"/api/opexpet/image?position=sentado";
                    sitImg.id = "pet-img";
                    petImg.parentNode.replaceChild(sitImg, petImg);
                    petImg = sitImg;

                    pet.style.transform = "scale(1)";

                    // 🔁 Actualizar la posición en el config y enviarlo al backend
                    petConfig.initialPosition = isOnRight ? "izquierda" : "derecha";
                    savePetConfig(petConfig);

                    isOnRight = !isOnRight;
                    isWalking = false;
                }
            }, intervalMs);
        });
    }

    function savePetConfig(config) {
        fetch(sourceAPiUrl +"/api/virtualpet", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(config)
        })
            .then(res => {
                if (!res.ok) throw new Error("Error saving config");
                return res.text();
            })
            .then(msg => console.log("✅ Pet config saved:", msg))
            .catch(err => console.error("❌ Failed to save pet config:", err));
    }

    // 📡 Cargar desde una API:
    fetch(sourceAPiUrl + "/api/virtualpet")
         .then(res => {
            if (res.status === 404) {
                // No hay mascota configurada
                return null;
            }

            if (!res.ok) {
                throw new Error("API error");
            }

            return res.json();
        })
        .then(config => {
            if (config && config.name && config.initialPosition) {
                // 🟢 Ya hay config válida
                initializePet(config);
            } else {
                // 🟡 No hay config válida, pedir nombre con SweetAlert
                Swal.fire({
                    title: "¿Cómo se llamará tu mascota?",
                    input: "text",
                    inputPlaceholder: "Ej. Michi, Rex, Pulgas...",
                    confirmButtonText: "Guardar",
                    showCancelButton: false,
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    inputValidator: (value) => {
                        if (!value) return "¡Debes escribir un nombre!";
                    }
                }).then(result => {
                    if (result.value) {
                        const petName = result.value;
    
                        // 🧬 Usar config base si no existe
                        const fallbackConfig = {
                            name: petName,
                            speed: 12000,
                            initialPosition: "derecha"
                        };

                        initializePet(fallbackConfig);  
    
                        // Opcional: guardar config nueva en el backend
                        fetch(sourceAPiUrl + "/api/virtualpet", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify(fallbackConfig)
                        })
                            .then(res => {
                                if (!res.ok) throw new Error("Error saving config");
                                return res.text();
                            })
                            .then(msg => msg)
                            .catch(err => err);
                    }
                });
            }
        })
        .catch(err => {
            // console.error("❌ Error loading pet config:", err);
            // Aquí podrías mostrar un error bonito o fallback total si deseas
        });
    