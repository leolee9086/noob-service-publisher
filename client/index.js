function getAttributeInParents(target, 属性名) {
  if (!target) {
    return null;
  }
  if (target.getAttribute(属性名) && target.getAttribute(属性名) !== "null") {
    return target;
  } else {
    return getAttributeInParents(target.parentElement, 属性名);
  }
}
function addScript(path, id) {
  return new Promise((resolve) => {
    if (document.getElementById(id)) {
      // 脚本加载后再次调用直接返回
      resolve(false);
      return false;
    }
    const scriptElement = document.createElement("script");
    scriptElement.src = path;
    scriptElement.async = true;
    // 循环调用时 Chrome 不会重复请求 js
    document.head.appendChild(scriptElement);
    scriptElement.onload = () => {
      if (document.getElementById(id)) {
        // 循环调用需清除 DOM 中的 script 标签
        scriptElement.remove();
        resolve(false);
        return false;
      }
      scriptElement.id = id;
      resolve(true);
    };
  });
}
function openFileById(option) {
  window.open(`/block/${option.id}`);
}
function getIconByType(type, sub) {
  let iconName = "";
  switch (type) {
    case "NodeDocument":
      iconName = "iconFile";
      break;
    case "NodeThematicBreak":
      iconName = "iconLine";
      break;
    case "NodeParagraph":
      iconName = "iconParagraph";
      break;
    case "NodeHeading":
      if (sub) {
        iconName = "icon" + sub.toUpperCase();
      } else {
        iconName = "iconHeadings";
      }
      break;
    case "NodeBlockquote":
      iconName = "iconQuote";
      break;
    case "NodeList":
      if (sub === "t") {
        iconName = "iconCheck";
      } else if (sub === "o") {
        iconName = "iconOrderedList";
      } else {
        iconName = "iconList";
      }
      break;
    case "NodeListItem":
      iconName = "iconListItem";
      break;
    case "NodeCodeBlock":
    case "NodeYamlFrontMatter":
      iconName = "iconCode";
      break;
    case "NodeTable":
      iconName = "iconTable";
      break;
    case "NodeBlockQueryEmbed":
      iconName = "iconSQL";
      break;
    case "NodeSuperBlock":
      iconName = "iconSuper";
      break;
    case "NodeMathBlock":
      iconName = "iconMath";
      break;
    case "NodeHTMLBlock":
      iconName = "iconHTML5";
      break;
    case "NodeWidget":
      iconName = "iconBoth";
      break;
    case "NodeIFrame":
      iconName = "iconLanguage";
      break;
    case "NodeVideo":
      iconName = "iconVideo";
      break;
    case "NodeAudio":
      iconName = "iconRecord";
      break;
  }
  return iconName;
}
/*宽度缩放*/
window.centerElement = document.querySelector("layout__center");
window.addEventListener("mousedown", startResize);
window.addEventListener("mousemove", resizing);
window.addEventListener("mouseup", (event) => {
  window.isResizing = false;
  window.resizeTarget = null;
  window.resizer = null;
});

function startResize(event) {
  let target = event.target;
  if (target.className == "layout__resize--lr layout__resize") {
    window.isResizing = true;
    window.resizeTarget =
      target.getAttribute("id") == "resizeLeft"
        ? document.getElementById("panelLeft")
        : document.getElementById("panelRight");
    window.resizer = target;
  }
}
function resizing(event) {
  if (
    window.isResizing &&
    window.resizer &&
    window.resizer.getAttribute("id") == "resizeLeft"
  ) {
    window.resizeTarget.style.width =
      event.clientX - window.resizeTarget.offsetLeft + "px";
  } else if (
    window.isResizing &&
    window.resizer &&
    window.resizer.getAttribute("id") == "resizeRight"
  ) {
    console.log(window.resizeTarget);
    window.resizeTarget.style.width =
      window.resizeTarget.offsetLeft +
      window.resizeTarget.offsetWidth -
      event.clientX +
      "px";
  }
}

/*渲染反向链接*/
window.addEventListener("load", () => {
  setTimeout(() => {
    let backlinkContainer = document.querySelector(".backlink");
    if (backlinkContainer) {
      backlinkContainer.innerHTML += `
        <div class="block__icons">
<div class="block__logo">
<svg><use xlink:href="#iconLink"></use></svg>
反向链接
</div>
</div>
<ul id="backlinks"></ul>
        <div class="block__icons">
<div class="block__logo">
<svg><use xlink:href="#iconLink"></use></svg>
提及
</div>
</div>
<ul id="backmentions"></ul>
        `;
      生成反向链接();
    }
  }, 500);
  async function 生成反向链接() {
    let id = document.head.querySelector("meta").getAttribute("data-node-id");
    let res = await fetch("/api/ref/getBacklink", {
      body: JSON.stringify({
        beforeLen: 10,
        k: "",
        id: id,
        mk: "",
      }),
      method: "POST",
    });
    res = await res.json();
    console.log(res);
    if (res && res.data && res.data.backlinks) {
      genbacklinkHTML(res.data.backlinks, document.querySelector("#backlinks"));
    }
    if (res && res.data && res.data.backmentions) {
      genbacklinkHTML(
        res.data.backmentions,
        document.querySelector("#backmentions")
      );
    }
  }
  function genbacklinkHTML(backlinks, element) {
    let html = "";

    backlinks.forEach((file) => {
      html += `<li class="b3-list-item" data-node-id="${file.id}" data-treetype="backlink"  data-subtype="">
<span style="padding-left: 0px" class="b3-list-item__toggle">
<svg data-id="0-Z%E5%BC%80%E5%A4%B4%E7%9A%84%E7%A9%BA%E8%AF%8D%E6%9D%A10" class="b3-list-item__arrow b3-list-item__arrow--open"><use xlink:href="#iconRight"></use></svg>
</span>
<svg class="b3-list-item__graphic popover__block" data-id="${file.id}"><use xlink:href="#iconFile"></use></svg>
<span class="b3-list-item__text"><a href="/block/${file.id}">${file.name}</a></span>
<span class="counter">${file.count}</span>
</li>`;
      if (file.blocks && file.blocks instanceof Array) {
        html += "<ul class>";
        file.blocks.forEach((block) => {
          html += `<li class="b3-list-item" data-node-id="${
            block.id
          }" data-treetype="backlink"  data-subtype="">
<svg class="b3-list-item__graphic popover__block" data-id="${
            block.id
          }" style="padding-left: 32px" ><use xlink:href="#${getIconByType(
            block.type,
            block.subType
          )}"></use></svg>
<span class="b3-list-item__text"><a href="/block/${block.id}">${
            block.content
          }</a></span>
</li>`;
          html += "</ul>";

          if (block.children && block.children[0]) {
            html += "<ul class>";

            block.children.forEach((child) => {
              html += `<li class="b3-list-item" data-node-id="${
                child.id
              }" data-treetype="backlink"  data-subtype="">
<svg class="b3-list-item__graphic popover__block" data-id="${
                child.id
              }" style="padding-left: 48px" ><use xlink:href="#${getIconByType(
                child.type,
                child.subType
              )}"></use></svg>
<span class="b3-list-item__text"><a href="/block/${child.id}">${
                child.content
              }</a></span>
</li>`;
            });
            html += "</ul>";
          }
        });
      }
    });
    element.innerHTML = html;
  }
});
/*搜索*/
setTimeout(() => {
    let searchInputer = document.querySelector('[data-type="navi-searcher"] input')
    searchInputer.parentElement.nextElementSibling.addEventListener('click', search)
    searchInputer.parentElement.nextElementSibling.addEventListener('touchstart', search)
    searchInputer.addEventListener('change', search)
    async function search(event) {
        console.log(searchInputer.value)
        if (searchInputer.value) {
            let res = await fetch('/api/search/fullTextSearchBlock', {
                body: JSON.stringify({
                    path: "",
                    query: searchInputer.value,
                    types:
                    {
                        "document": true,
                        "heading": true,
                        "list": true,
                        "listItem": true,
                        "codeBlock": true,
                        "htmlBlock": true,
                        "mathBlock": true,
                        "table": true,
                        "blockquote": true,
                        "superBlock": true,
                        "paragraph": true
                    }

                }),
                method: "POST",

            })
            res = await res.json()
            document.querySelector('.protyle').classList.add('fn__none')
            document.querySelector('.protyle').previousElementSibling.classList.remove('fn__none')
            document.querySelector('.protyle').previousElementSibling.classList.add('fn__flex-column')
            let notebooks = {}
            res.data.blocks.forEach(
                block => {
                    if (!notebooks[block.box]) {
                        notebooks[block.box] = {
                            name: document.querySelector(`[data-url='${block.box}'] .b3-list-item__text`).innerHTML,
                            children: {}
                        }
                    }
                    if (!notebooks[block.box].children[block.path]) {
                        notebooks[block.box].children[block.path] = {
                            hPath: block.hPath,
                            id: block.rootID,
                            children: {}

                        }
                    }
                    if (!notebooks[block.box].children[block.path].children[block.id]) {
                        notebooks[block.box].children[block.path].children[block.id] = block
                    }

                }
            )
            console.log(notebooks)
            let html1 = ''
            for (let id in notebooks) {

                html1 += `
                <div data-type="search-item" class="b3-list-item">
                    <div 
                    class="b3-list-item__meta b3-list-item__meta" 
                    title="${notebooks[id].name}">
                    <h1>
${notebooks[id].name}
</h1> 

                    </div>
                </div>
                `
                for (let fileid in notebooks[id].children) {
                    let file = notebooks[id].children[fileid]
                    html1 += `
                    <div data-type="search-item" class="b3-list-item" style="margin-left:16px">
                        <div 
                        class="b3-list-item__meta b3-list-item__meta" 
                        title="${file.hPath}">
                        <h2>
                            <a href="/block/${file.id}">
                            ${file.hPath}
                            </a>
                        </h2>
                        </div> 
                        </div>
                    `
                    for (let blockId in file.children) {
                        let block = file.children[blockId]
                        html1 += `
                        <div data-type="search-item" class="b3-list-item" style="margin-left:32px">
                        <div 
                        class="b3-list-item " 
                        title="${block.fcontent}">
                            <a href="/block/${block.id}" style="color:var(--b3-theme-on-background)">
                            ${block.content}
                            </a>
                        </div> 
                        </div>
                        `
                    }
                }
            }
            console.log(html1)
            console.log(document.querySelector('div#publishFooter'), (document.querySelector('div#publishFooter')).innerHTML)
            html1 += "</div>"
            html1 += (document.querySelector('div#publishFooter')).outerHTML

            document.querySelector('.protyle').previousElementSibling.innerHTML = html1
        }
        else {
            document.querySelector('.protyle').classList.remove('fn__none')
            document.querySelector('.protyle').previousElementSibling.classList.add('fn__none')
        }
    }
}, 500)
/*加密块*/
document.addEventListener('click', 获取私有块内容)
async function 获取私有块内容(event) {
    if (event.target.dataset.type == "customAuthToken") {
        let token = event.target.previousElementSibling.value
        let id = event.target.getAttribute('data-node-id')
        let res = await fetch('/getPrivateBlock', {
            body: JSON.stringify({
                id: id,
                token: token,
            }),
            method: "POST",
        })
        res = await res.json()
        if (res.data && res.data.content) {
            event.target.parentElement.parentElement.innerHTML = res.data.content
        }
    }
}
/*文档树*/
document.addEventListener('click', 展开或收起文档树)
async function 展开或收起文档树(event) {
    let target = event.target
    let 选取结果 = getAttributeInParents(target, 'data-url')
    let 选取结果1 = getAttributeInParents(target, 'data-node-id')
    console.log(选取结果, 选取结果1)
    if (选取结果 && 选取结果.dataset.type == 'notebook') {
        let path = '/'
        if (选取结果1) {
            path = 选取结果1.getAttribute("data-path")
        }
        console.log(选取结果)
        console.log(选取结果.getAttribute('data-url'))
        let res = await fetch('/api/filetree/listDocsByPath', {

            body: JSON.stringify({
                notebook: 选取结果.getAttribute('data-url'),
                path: path,
                sort: 0
            }),
            method: "POST",
        })
        res = await res.json()
        let 文档容器 = 选取结果.querySelector('ul')
        if (选取结果1) {
            文档容器 = 选取结果1.nextElementSibling

            if (文档容器 && 文档容器.tagName == "UL") {
                文档容器.remove()
            }
            else if (文档容器 && 文档容器.tagName == 'LI') {
                let 新文档容器 = document.createElement('ul')
                文档容器.parentElement.insertBefore(新文档容器, 文档容器)
                文档容器 = 新文档容器
            }
            if (!文档容器 && res.data) {
                文档容器 = document.createElement("ul")
                选取结果1.parentElement.appendChild(文档容器)
            }


        }
        if (!文档容器 || !res.data || !res.data.files) { return }
        if (文档容器 && 文档容器.querySelector('li')) {
            文档容器.innerHTML = ''
            return
        }
        let html = ''

        if (res.data) {
            res.data.files.forEach(
                file => {
                    if (file) {
                        html += `
                    <li title="${file.name} 
包含 ${file.subFileCount} 个子文档
更新于 ${file.hMtime}
创建于 ${file.hCtime}" data-node-id="${file.id}" data-name="${file.name}" draggable="true" data-count="2" data-type="navigation-file" class="b3-list-item b3-list-item--hide-action" data-path="${file.path}">
<span style="padding-left: ${16 * file.path.split('/').length - 16}px" class="b3-list-item__toggle b3-list-item__toggle--hl ${file.subFileCount ? '' : 'fn__hidden'}">
<svg class="b3-list-item__arrow"><use xlink:href="#iconRight"></use></svg>
</span>
<span class="b3-list-item__icon b3-tooltips b3-tooltips__n" aria-label="修改图标"><svg class="custom-icon"><use xlink:href="#icon-1f4d1"></use></svg></span>
<span class="b3-list-item__text"><a href="/block/${file.id}">${file.name.endsWith(".sy") ? file.name.slice(0, file.name.length - 3) : file.name}</a></span>
<span data-type="more-file" class="b3-list-item__action b3-tooltips b3-tooltips__nw" aria-label="更多">
<svg><use xlink:href="#iconMore"></use></svg>
</span>
<span class="popover__block counter b3-tooltips b3-tooltips__nw" aria-label="引用块">${file.count}</span>
</li>
                    
                    `
                    }
                }
            )
        }
        文档容器.innerHTML = html

    }
}
/*图谱*/
window.addEventListener("load", () => {
    document.addEventListener('click', 展开或收起图表菜单)
    function 展开或收起图表菜单(event) {

        let panelElement = document.querySelector('.graph__panel')
        let target = getAttributeInParents(event.target, "data-type")
        let dataType = getAttributeInParents(event.target, "data-type").getAttribute("data-type")
        console.log(panelElement, dataType)
        if (dataType === "menu") {
            if (target.classList.contains("ft__primary")) {
                target.classList.remove("ft__primary");
                panelElement.style.right = "";
                setTimeout(onGraph, 100)

            }
            else {
                target.classList.add("ft__primary");
                panelElement.style.right = "0";
            }
        }
    }
    setTimeout(onGraph, 500)
    async function onGraph(hl) {
        let inputElement = document.querySelector('#panelRight .b3-form__icon-input')
        let blockId = document.querySelector('meta').dataset.nodeId
        let panelElement = document.querySelector('.graph__panel')
        let graphElement = document.querySelector('.graph__svg')
        console.log(panelElement, inputElement, blockId)

        let type = {
            list: panelElement.querySelector("[data-type='list']").checked,
            listItem: panelElement.querySelector("[data-type='listItem']").checked,
            math: panelElement.querySelector("[data-type='math']").checked,
            paragraph: panelElement.querySelector("[data-type='paragraph']").checked,
            super: panelElement.querySelector("[data-type='super']").checked,
            table: panelElement.querySelector("[data-type='table']").checked,
            tag: panelElement.querySelector("[data-type='tag']").checked,
            heading: panelElement.querySelector("[data-type='heading']").checked,
            blockquote: panelElement.querySelector("[data-type='blockquote']").checked,
            code: panelElement.querySelector("[data-type='code']").checked,

        }
        let d3 = {
            arrow: panelElement.querySelector("[data-type='arrow']").checked,
            nodeSize: parseFloat(panelElement.querySelector("[data-type='nodeSize']").value),
            centerStrength: parseFloat(panelElement.querySelector("[data-type='centerStrength']").value),
            collideRadius: parseFloat(panelElement.querySelector("[data-type='collideRadius']").value),
            collideStrength: parseFloat(panelElement.querySelector("[data-type='collideStrength']").value),
            lineOpacity: parseFloat(panelElement.querySelector("[data-type='lineOpacity']").value),
            linkDistance: parseFloat(panelElement.querySelector("[data-type='linkDistance']").value),
            linkWidth: parseFloat(panelElement.querySelector("[data-type='linkWidth']").value),
        };
        let option = {
            k: '',
            id: blockId,
            conf: {
                type,
                d3,
                dailyNote: panelElement.querySelector("[data-type='dailyNote']").checked,
            }
        }
        console.log(option)
        let res = await fetch("/api/graph/getLocalGraph", {
            body: JSON.stringify(option),
            method: "POST",
        })
        res = await res.json()
        graphData = res.data
        console.log(graphElement)
        if (graphElement.clientHeight === 0) {
            // 界面没有渲染时不能进行渲染
            return;
        }
        if (!graphData || !graphData.nodes || graphData.nodes.length === 0) {
            if (this.network) {
                this.network.destroy();
            }
            graphElement.firstElementChild.classList.add("fn__none");
            return;
        }
        clearTimeout(this.timeout);
        addScript(`/stage/protyle/js/vis/vis-network.min.js?v=9.0.4`, "protyleVisScript").then(() => {
            this.timeout = window.setTimeout(() => {
                graphElement.firstElementChild.classList.remove("fn__none");
                graphElement.firstElementChild.firstElementChild.setAttribute("style", "width:3%");
                const config = option.conf
                const data = {
                    nodes: this.graphData.nodes,
                    edges: this.graphData.links,
                };
                const rootStyle = getComputedStyle(document.body);
                const options = {
                    autoResize: true,
                    interaction: {
                        hover: true,
                    },
                    nodes: {
                        borderWidth: 0,
                        borderWidthSelected: 5,
                        shape: "dot",
                        font: {
                            face: rootStyle.getPropertyValue("--b3-font-family-graph").trim(),
                            size: 32,
                            color: rootStyle.getPropertyValue("--b3-theme-on-background").trim(),
                        },
                        color: {
                            hover: {
                                border: rootStyle.getPropertyValue("--b3-graph-hl-point").trim(),
                                background: rootStyle.getPropertyValue("--b3-graph-hl-point").trim()
                            },
                            highlight: {
                                border: rootStyle.getPropertyValue("--b3-graph-hl-point").trim(),
                                background: rootStyle.getPropertyValue("--b3-graph-hl-point").trim()
                            },
                        },
                    },
                    edges: {
                        width: config.d3.linkWidth,
                        arrowStrikethrough: false,
                        smooth: false,
                        color: {
                            opacity: config.d3.lineOpacity,
                            hover: rootStyle.getPropertyValue("--b3-graph-hl-line").trim(),
                            highlight: rootStyle.getPropertyValue("--b3-graph-hl-line").trim(),
                        }
                    },
                    layout: {
                        improvedLayout: false
                    },
                    physics: {
                        enabled: true,
                        forceAtlas2Based: {
                            theta: 0.5,
                            gravitationalConstant: -config.d3.collideRadius,
                            centralGravity: config.d3.centerStrength,
                            springConstant: config.d3.collideStrength,
                            springLength: config.d3.linkDistance,
                            damping: 0.4,
                            avoidOverlap: 0.5
                        },
                        maxVelocity: 50,
                        minVelocity: 0.1,
                        solver: "forceAtlas2Based",
                        stabilization: {
                            enabled: true,
                            iterations: 256,
                            updateInterval: 25,
                            onlyDynamicEdges: false,
                            fit: true
                        },
                        timestep: 0.5,
                        adaptiveTimestep: true,
                        wind: { x: 0, y: 0 }
                    },
                };
                const network = new vis.Network(graphElement.lastElementChild, data, options);
                window.network = network;
                network.on("stabilizationIterationsDone", () => {
                    network.physics.stopSimulation();
                    graphElement.firstElementChild.classList.add("fn__none");
                    if (hl) {
                        this.hlNode(this.blockId);
                    }
                });
                network.on("dragEnd", () => {
                    setTimeout(() => {
                        network.physics.stopSimulation();
                    }, 5000);
                });
                network.on("stabilizationProgress", (data) => {
                    graphElement.firstElementChild.firstElementChild.setAttribute("style", `width:${Math.max(5, data.iterations) / data.total * 100}%`);
                });
                network.on("click", (params) => {
                    console.log(params)
                    if (params.nodes.length !== 1) {
                        return;
                    }
                    const node = graphData.nodes.find((item) => item.id === params.nodes[0]);
                    if (!node) {
                        return;
                    }
                    if (params.event.shiftKey) {
                        openFileById({
                            id: node.id,
                            position: "bottom",
                            hasContext: true,
                            action: [Constants.CB_GET_FOCUS]
                        });
                    }
                    else if (params.event.altKey) {
                        openFileById({
                            id: node.id,
                            position: "right",
                            hasContext: true,
                            action: [Constants.CB_GET_FOCUS]
                        });
                    }
                    else if (params.event.ctrlKey) {
                        window.siyuan.blockPanels.push(new BlockPanel({
                            targetElement: this.inputElement,
                            nodeIds: [node.id],
                        }));
                    }
                    else {
                        openFileById({ id: node.id, hasContext: true });
                    }
                });
            }, 500);
        });
    }
})
/*滚屏*/
function scrollToId(id) {
    let inpageBlock = document.querySelector(`.protyle-wysiwyg.protyle-wysiwyg--attr [data-node-id='${id}']`)
    if (inpageBlock) {
        console.log(inpageBlock)
        inpageBlock.scrollIntoView({
            behavior: "smooth",
            block: "center"
        })
        setTimeout(
            () => {
                let style = inpageBlock.getAttribute("style")
                inpageBlock.style.border = "2.5px dashed var(--b3-card-info-color)"
                inpageBlock.style.backgroundColor = "var(--b3-card-info-background)"
                setTimeout(
                    () => { inpageBlock.setAttribute("style", style) }, 1000
                )

            }, 50
        )
    }

}
document.addEventListener('click', (event) => {
    let target = event.target
    let href = target.getAttribute("href")
    if (href) {
        let last = href.split("/").pop()
        let reg = /^\d{14}\-[0-9a-z]{7}$/
        let inpageBlock = document.querySelector(`.protyle-wysiwyg.protyle-wysiwyg--attr [data-node-id='${last}']`)
        if (reg.test(last) && inpageBlock) {
            event.stopPropagation()
            event.preventDefault()
            scrollToId(last)
        }
    }
})
window.addEventListener(
    "load", () => {
        let id = window.location.href.split("/").pop()
        let reg = /^\d{14}\-[0-9a-z]{7}$/
        if (reg.test(id)) {
            setTimeout(
                () => scrollToId(id)
                , 1000
            )
        }
    }
)
