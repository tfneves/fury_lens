let FuryLens = {
    magnifier: (img) => {
        createMagnifier(img);
    },
    configs: {
        timeout: 5000, // Miliseconds
        language: "", // default language is pt-BR
        maxMagnifierSize: 1000, // default max magnifier sized in pixel (px)
        minMagnifierSize: 0, // default minimum magnifier sized in pixel (px)
        minMagnifierZoom: 2, // default minimum magnifier zoom is 2x
        maxMagnifierZoom: 10, //default max magnifier zoom is 10x
    },
    style: {
        position: "top", // default position
        borderRadius: 0, // default magnifier radius in pixel (px)
        borderSize: 2, // default magnifier border size in pixel (px)
        borderColor: "#A9A9A9", // default magnifier color
        borderType: "solid" // default magnifier border type
    }
}


function createZoom(img, magnifierValue, zoom){
    let glass, w, h, bw;

    /* Create magnifier glass case not exist */
    if(document.getElementById(`glass-${img.getAttribute("id")}`) === null){
        glass = document.createElement("DIV");
        glass.setAttribute("id", `glass-${img.getAttribute("id")}`);
        img.parentElement.insertBefore(glass, img);
    }else{
        glass = document.getElementById(`glass-${img.getAttribute("id")}`);
    }

    glass.style.cssText = `
      box-sizing: border-box;
      position: absolute;
      border-radius: ${FuryLens.style.borderRadius}px;
      border: ${FuryLens.style.borderSize}px ${FuryLens.style.borderType} ${FuryLens.style.borderColor};
      width: ${magnifierValue}px;
      height: ${magnifierValue}px;
      cursor: none;`;

    /* Set background properties for the magnifier glass: */
    glass.style.backgroundImage = `url('${img.src}')`;
    glass.style.backgroundRepeat = "no-repeat";
    glass.style.backgroundSize = `${(img.width * zoom)}px ${(img.height * zoom)}px`;
    bw = 3;
    w = glass.offsetWidth / 2;
    h = glass.offsetHeight / 2;

    /* Execute a function when someone moves the magnifier glass over the image: */
    glass.addEventListener("mousemove", moveMagnifier);
    img.addEventListener("mousemove", moveMagnifier);
    /*and also for touch screens:*/
    glass.addEventListener("touchmove", moveMagnifier);
    img.addEventListener("touchmove", moveMagnifier);

    function moveMagnifier(e) {
        let pos, x, y;

        /* Prevent any other actions that may occur when moving over the image */
        e.preventDefault();

        /* Get the cursor's x and y positions: */
        pos = getCursorPos(e);
        let cords = cordenatesPreventOutsideImage(pos.x, pos.y, img, glass, zoom);
        x = cords.x;
        y = cords.y;

        /* Set the position of the magnifier glass: */
        glass.style.left = `${(x - w)}px`;
        glass.style.top = `${(y - h)}px`;

        /* Display what the magnifier glass "sees": */
        glass.style.backgroundPosition = `-${((x * zoom) - w + bw)}px -${((y * zoom) - h + bw)}px`;
    }

    function getCursorPos(e) {
        let a, x = 0, y = 0;
        e = e || window.event;

        /* Get the x and y positions of the image: */
        a = img.getBoundingClientRect();

        /* Calculate the cursor's x and y coordinates, relative to the image: */
        x = e.pageX - a.left;
        y = e.pageY - a.top;

        /* Consider any page scrolling: */
        x = x - window.pageXOffset;
        y = y - window.pageYOffset;
        return {x : x, y : y};
    }
}

/* Prevent the magnifier glass from being positioned outside the image: */
function cordenatesPreventOutsideImage(cordX, cordY, img, glass, zoom)
{
    let w = glass.offsetWidth / 2;
    let h = glass.offsetHeight / 2;

    if (cordX > img.width - (w / zoom)) {cordX = img.width - (w / zoom);}
    if (cordX < w / zoom) {cordX = w / zoom;}
    if (cordY > img.height - (h / zoom)) {cordY = img.height - (h / zoom);}
    if (cordY < h / zoom) {cordY = h / zoom;}

    return {x: cordX, y: cordY}
}

function createMagnifier(baseImg){
    createDOMSkeleton(baseImg);

    let r = setInterval(()=>{
        if(
            document.getElementById(`sizeMagnifier-${baseImg}`) !== null &&
            document.getElementById(`zoomMagnifier-${baseImg}`) !== null
        ){
            clearInterval(r);

            let glass, sizeMagnifier, zoomMagnifier;
            sizeMagnifier = document.getElementById(`sizeMagnifier-${baseImg}`);
            zoomMagnifier = document.getElementById(`zoomMagnifier-${baseImg}`);

            do{
                self.createZoom(document.getElementById(baseImg), sizeMagnifier.value, zoomMagnifier.value);
                glass = document.getElementById(`glass-${baseImg}`);
            }while(glass == null)

            document.addEventListener("keypress", (e)=>{
                if(e.shiftKey && e.key.toLowerCase() === "q"){
                    glass.style.display = "none";
                    sizeMagnifier.value = "0";
                }
            });

            sizeMagnifier.addEventListener("input", ()=>{
                if(sizeMagnifier.value === "0")
                    glass.style.display = "none";
                else{
                    glass.style.display = "block";
                    self.createZoom(document.getElementById(baseImg), sizeMagnifier.value, zoomMagnifier.value);
                }
            });

            zoomMagnifier.addEventListener("input", ()=>{
                self.createZoom(document.getElementById(baseImg), sizeMagnifier.value, zoomMagnifier.value);
            });
        }
    },800);
}


function createDOMSkeleton(baseImg)
{
    let label1, label2;

    switch (FuryLens.configs.language){
        case "en":
            label1 = "Magnifier size";
            label2 = "Magnification size";
            break;

        case "es":
            label1 = "Tamaño de gafa"
            label2 = "Tamaño de la ampliación"
            break;

        default:
            label1 = "Tamanho da lupa"
            label2 = "Zoom da lupa"
            break;
    }

    let r = setInterval(()=>{
        if(document.getElementById(baseImg) !== null){
            clearInterval(r);

            let tmpImg = document.getElementById(baseImg);
            document.getElementById(baseImg).outerHTML = `
                <div style="margin-top: 30px">
                    <div style="border: solid 1px ; border-radius: 4px; margin-bottom: 20px; text-align: center !important">
                        <div 
                            style="padding: 10px 0 10px 5px"
                            ${(()=>{
                                return FuryLens.configs.minMagnifierSize == FuryLens.configs.maxMagnifierSize ? "hidden" : ""
                            })()}
                        >
                            <label>${label1}</label>
                            <div>
                                <input 
                                    type="range" 
                                    id="sizeMagnifier-${tmpImg.getAttribute("id")}" 
                                    value="${FuryLens.configs.minMagnifierSize}" 
                                    min="${FuryLens.configs.minMagnifierSize}" 
                                    max="${FuryLens.configs.maxMagnifierSize}" 
                                    style="width: 50%;"
                                >
                            </div>
                        </div>
                        <div 
                            style="padding: 10px 0 10px 5px"
                            ${(()=>{
                                return FuryLens.configs.minMagnifierZoom == FuryLens.configs.maxMagnifierZoom ? "hidden" : ""
                            })()}
                        >
                            <label>${label2}</label>
                            <div>
                                <input type="range" id="zoomMagnifier-${tmpImg.getAttribute("id")}" value="${FuryLens.configs.minMagnifierZoom}" min="${FuryLens.configs.minMagnifierZoom}" max="${FuryLens.configs.maxMagnifierZoom}" list="tickmarks-${tmpImg.getAttribute("id")}" style="width: 50%;">
                                <div style="display: flex; flex-direction: row; justify-content: center;">
                                    <datalist id="tickmarks-${tmpImg.getAttribute("id")}" style="display: flex; justify-content: space-between; width: 50%">
                                      ${(()=>{
                                            let optionItens = "";
                                            for (let i = FuryLens.configs.minMagnifierZoom; i <= FuryLens.configs.maxMagnifierZoom; i++) {
                                                optionItens += `<option value="${i}" label="${i}x">`;
                                            }
                                            return optionItens;
                                        })()}
                                    </datalist>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div style="position: relative; box-sizing: border-box;">${tmpImg.outerHTML}</div>
                    </div>
                </div>`;
        }
    },800);
}