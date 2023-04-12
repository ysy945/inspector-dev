"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
const go_1 = __importDefault(require("./utils/go"));
class Displayer {
    constructor(startInspect, stopInspect) {
        this.conContainer = document.createElement("div");
        this.itemCodeInfoList = [];
        this.open = () => {
            this.warp.style.display = "block";
            this.isOpen = true;
            this.addEventListeners();
        };
        this.close = () => {
            this.warp.style.display = "none";
            this.isOpen = false;
            this.removeEventListeners();
        };
        this.append = () => {
            if (this.isAppend === false) {
                document.body.appendChild(this.warp);
                this.isOpen = true;
                this.isAppend = true;
            }
        };
        this.addEventListeners = () => {
            const { warp, drag } = this;
            warp.addEventListener("mousedown", this.onMousedown);
            warp.addEventListener("mouseenter", this.onMouseenter);
            warp.addEventListener("mouseleave", this.onMouseleave);
            drag.addEventListener("mousedown", this.onMousedownWithDrag);
            document.addEventListener("mouseup", this.onMouseup);
            document.addEventListener("mousemove", this.onMousemove);
        };
        this.removeEventListeners = () => {
            const { warp, drag } = this;
            warp.removeEventListener("mousedown", this.onMousedown);
            warp.removeEventListener("mouseenter", this.onMouseenter);
            warp.removeEventListener("mouseleave", this.onMouseleave);
            drag.removeEventListener("mousedown", this.onMousedownWithDrag);
            document.removeEventListener("mouseup", this.onMouseup);
            document.removeEventListener("mousemove", this.onMousemove);
        };
        this.addItem = (allCodeInfo) => {
            if (!this.pushCodeInfo(allCodeInfo))
                return;
            const that = this;
            const container = this.conContainer;
            const item = document.createElement("div");
            item.className = "inspector-wrapper-content-container-item";
            function create(codeInfo, isFirst) {
                const item_child = that.createItemChild(isFirst, codeInfo, () => {
                    item.removeEventListener("mousedown", stopPropagation);
                    item.removeEventListener("click", stopPropagation);
                });
                if (isFirst) {
                    that.active(item_child);
                }
                if (!item_child) {
                    if (codeInfo.parent && Object.keys(codeInfo.parent).length) {
                        create(codeInfo.parent, isFirst);
                    }
                    return;
                }
                item_child.addEventListener("mousedown", stopPropagation);
                item_child.addEventListener("click", function () {
                    that.active(item_child);
                });
                item_child.addEventListener("dblclick", function () {
                    (0, go_1.default)(codeInfo.inspectorFilename, codeInfo.line, codeInfo.column);
                });
                item.append(item_child);
                container.append(item);
                if (codeInfo.parent && Object.keys(codeInfo.parent).length) {
                    create(codeInfo.parent, false);
                }
            }
            const stopPropagation = function (e) {
                e.stopPropagation();
            };
            item.addEventListener("mousedown", stopPropagation);
            item.addEventListener("click", stopPropagation);
            create(allCodeInfo, true);
        };
        this.createItemChild = (isFirst, codeInfo, removeListener) => {
            const that = this;
            const { name, inspectorComponentName, inspectorFilename, column, line } = codeInfo;
            const item_child = document.createElement("div");
            item_child.className = "inspector-wrapper-content-container-item-child";
            const left = document.createElement("div");
            left.className = "inspector-wrapper-content-container-item-child-left";
            if (!isFirst)
                left.style.width = "100%";
            const p1 = document.createElement("p");
            const p2 = document.createElement("p");
            const title = this.createTitle(name, inspectorComponentName);
            const filePath = this.createFilePath(inspectorFilename, column, line);
            if (!title || !filePath)
                return;
            p1.innerText = title;
            p2.innerText = filePath;
            Object.assign(p2.style, {
                fontWeight: "600",
            });
            left.append(p1, p2);
            if (isFirst) {
                const right = document.createElement("div");
                right.className = "inspector-wrapper-content-container-item-child-right";
                const btn = document.createElement("div");
                btn.innerText = `删除`;
                const btn2 = document.createElement("div");
                btn2.innerText = `展开`;
                const handleBtnClick = function (e) {
                    e.stopPropagation();
                    const remover = btn.parentNode.parentNode.parentNode;
                    const parent = remover === null || remover === void 0 ? void 0 : remover.parentNode;
                    that.deleteCodeInfo(codeInfo);
                    btn.removeEventListener("click", handleBtnClick);
                    removeListener();
                    parent === null || parent === void 0 ? void 0 : parent.removeChild(remover);
                };
                const handleBtn2Click = function (e) {
                    e.stopPropagation();
                    const parentNode = btn2.parentElement.parentElement.parentElement;
                    if (btn2.innerText === "展开") {
                        Object.assign(parentNode.style, {
                            height: parentNode.children.length * 36 + "px",
                        });
                        btn2.innerText = "收回";
                    }
                    else {
                        Object.assign(parentNode.style, {
                            height: 36 + "px",
                        });
                        btn2.innerText = "展开";
                    }
                };
                btn.addEventListener("click", handleBtnClick);
                btn2.addEventListener("click", handleBtn2Click);
                right.append(btn, btn2);
                item_child.append(left, right);
                return item_child;
            }
            item_child.append(left);
            return item_child;
        };
        this.createTitle = (name, componentName) => {
            if (name && componentName)
                return `${name} in ${componentName}`;
            else if (name && !componentName)
                return name;
            else {
                return undefined;
            }
        };
        this.createFilePath = (filename, column, line) => {
            if (!filename)
                return undefined;
            if (!column || !line)
                return filename;
            return `${filename}:${line}:${column}`;
        };
        this.getItemDoms = () => {
            return document.querySelectorAll(".inspector-wrapper-content-container-item");
        };
        this.active = (dom) => {
            if (this.activeDom) {
                this.activeDom.classList.remove("inspector-active");
            }
            this.activeDom = dom;
            if (!dom.classList.contains("inspector-active")) {
                dom.classList.add("inspector-active");
            }
        };
        this.pushCodeInfo = (codeInfo) => {
            if (!codeInfo.column || !codeInfo.line || !codeInfo.inspectorFilename)
                return false;
            const itemCodeInfoList = this.itemCodeInfoList;
            for (let key in itemCodeInfoList) {
                const info = itemCodeInfoList[key];
                if (this.isCodeInfoEqual(info, codeInfo)) {
                    //高亮对应位置
                    const codeInfoDom = this.getItemDoms()[key].children[0];
                    this.active(codeInfoDom);
                    return false;
                }
            }
            itemCodeInfoList.push(codeInfo);
            return true;
        };
        this.deleteCodeInfo = (codeInfo) => {
            const index = this.itemCodeInfoList.findIndex((i) => this.isCodeInfoEqual(i, codeInfo));
            if (index !== -1) {
                this.itemCodeInfoList.splice(index, 1);
            }
        };
        this.isCodeInfoEqual = (A, B) => {
            return (A.column === B.column &&
                A.inspectorFilename === B.inspectorFilename &&
                A.line === B.line);
        };
        this.isOpen = false;
        this.isAppend = false;
        this.warp = document.createElement("div");
        this.drag = document.createElement("i");
        this.background = document.createElement("div");
        this.content = document.createElement("div");
        this.isDown = false;
        this.isDrag = false;
        this.offsetX = 0;
        this.offsetY = 0;
        this.maxArea = {
            x: [0, window.innerWidth],
            y: [0, window.innerHeight],
        };
        this.startInspect = startInspect;
        this.stopInspect = stopInspect;
        const onMousedown = function (e) {
            this.isDown = true;
            this.isDrag = false;
            this.offsetX = e.offsetX;
            this.offsetY = e.offsetY;
        };
        const onMousedownWithDrag = function (e) {
            e.stopPropagation();
            this.isDrag = true;
            this.isDown = false;
            this.offsetX = e.clientX;
            this.offsetY = e.clientY;
        };
        const onMouseenter = function (e) {
            if (e.relatedTarget &&
                e.relatedTarget.outerHTML === "<div>删除</div>")
                return;
            this.stopInspect(false);
        };
        const onMouseleave = function () {
            this.startInspect(false);
        };
        const onMouseup = function () {
            this.isDown = false;
            this.isDrag = false;
            this.offsetX = 0;
            this.offsetY = 0;
        };
        const onMousemove = function (event) {
            const { offsetX, offsetY, isDown, isDrag, maxArea, warp, background } = this;
            event.preventDefault();
            let deltaX = event.clientX - offsetX;
            let deltaY = event.clientY - offsetY;
            if (isDown) {
                if (deltaX < 0) {
                    deltaX = 0;
                }
                if (deltaX > maxArea["x"][1]) {
                    deltaX = maxArea["x"][1];
                }
                if (deltaY < 0) {
                    deltaY = 0;
                }
                if (deltaY > maxArea["y"][1]) {
                    deltaY = maxArea["y"][1];
                }
                warp.style.left = deltaX + "px";
                warp.style.top = deltaY + "px";
            }
            if (isDrag) {
                const height = warp.offsetHeight - deltaY;
                const width = warp.offsetWidth + deltaX;
                const top = warp.offsetTop + deltaY;
                warp.style.width = width + "px";
                warp.style.top = top + "px";
                warp.style.height = height + "px";
                background.style.backdropFilter =
                    background.style.backdropFilter === "blur(20px)"
                        ? "blur(21px)"
                        : "blur(20px)";
                this.offsetX = event.clientX;
                this.offsetY = event.clientY;
            }
        };
        this.onMousedown = onMousedown.bind(this);
        this.onMousedownWithDrag = onMousedownWithDrag.bind(this);
        this.onMouseenter = onMouseenter.bind(this);
        this.onMouseleave = onMouseleave.bind(this);
        this.onMouseup = onMouseup.bind(this);
        this.onMousemove = onMousemove.bind(this);
        (0, index_1.addExternalElement)(this.warp);
        (0, index_1.addExternalElement)(this.content);
        (0, index_1.addExternalElement)(this.background);
        (0, index_1.addExternalElement)(this.conContainer);
        initWarp(this);
    }
}
exports.default = Displayer;
const STYLE_INNERHTML = `.inspector-app-wrapper {
  position: fixed;
  z-index:100001;
  left: 0px;
  top: 0px;
  width: 300px;
  height: 400px;
  overflow: hidden;
  border-radius: 10px;
}
.inspector-drag {
  display: inline-block;
  width: 10px;
  height: 10px;
  position: absolute;
  z-index: 10;
  cursor: ne-resize;
  opacity: 0;
  top: -2px;
  right: -2px;
}
.inspector-app-wrapper-front {
  background-color: rgba(219, 214, 214, 0);
  width: 100%;
  height: 100%;
  display:flex;
}
.inspector-app-wrapper-background {
  position: absolute;
  left: 0px;
  top: 0px;
  background-color: rgba(219, 214, 214, 0.6);
  width: 100%;
  height: 100%;
  resize: both;
  backdrop-filter:blur(20px);
}
.inspector-content-header{
  display:flex;
  position:absolute;
  top:6px;
  left:4px;
}
.inspector-close-wrapper-icon {
  line-height: 15px;
  text-align: center;
  width: 13px;
  height: 13px;
  margin:4px;
  border-radius: 50%;
  background-color: #ed6a6f;
  opacity: 1;
  font-size: 12px;
  cursor: pointer;
}
.inspector-wrapper-divider{
  width:96%;
  height:2px;
  left:2%;
  right:2%;
  background-color:#d5cece;
  position:absolute;
  top:30px;
  opacity:0.5;

}
.inspector-wrapper-content-container{
  position:absolute;
  display:flex;
  justify-content:flex-start;
  align-items:center;
  width:100%;
  flex-direction:column;
  top:32px;
  height:calc(100% - 70px);
  overflow:scroll;
}
.inspector-wrapper-content-container::-webkit-scrollbar{
    display: none;
}
.inspector-wrapper-content-container-item{
  background-color: #c9c1c1a3;
  width: 95%;
  transition: 0.5s;
  border-radius: 5px;
  margin: 5px 0px;
  color: gray;
  font-size: 12px;
  overflow:hidden;
  box-sizing:border-box;
  font-weight:700;
  height:36px;
  flex:0 0 auto;
}
.inspector-wrapper-content-container-item-child{
  width:100%;
  box-sizing:border-box;
  transition:.2s;
  border-radius: 5px;
  display:flex;
  cursor:pointer;
}

.inspector-wrapper-content-container-item-child-left{
  width:70%;
}
.inspector-wrapper-content-container-item-child-left>p{
  margin:0;
  padding:0px 4px;
  overflow:hidden;
  white-space: nowrap;
  text-overflow: ellipsis
}
.inspector-wrapper-content-container-item-child-right{
  width:30%;
  display:flex;
  justify-content:space-around;
  align-items:center;
}
.inspector-wrapper-content-container-item-child-right>div{
  height:25px;
  line-height:25px;
  width:45%;
  text-align:center;
  padding:0;
  border-radius:10px;
  border:1px solid #cac7c7;
  transition:.2s;
  cursor:pointer;
}
.inspector-wrapper-content-container-item-child-right>div:hover{
  background-color:#ee8079;
  color:white;
}

.inspector-active{
  background-color:#b2d6b291
}
`;
function initWarp(displayer) {
    const { warp, drag, content, background } = displayer;
    warp.className = "inspector-app-wrapper";
    drag.className = "inspector-drag";
    background.className = "inspector-app-wrapper-background";
    content.className = "inspector-app-wrapper-front";
    initContent(displayer);
    warp.append(drag, background, content);
    const style = document.createElement("style");
    style.innerHTML = STYLE_INNERHTML;
    document.head.append(style);
    displayer.addEventListeners();
}
function initContent(displayer) {
    const header = document.createElement("div");
    header.className = "inspector-content-header";
    const icon = createIcon(displayer);
    header.append(icon);
    const divider = document.createElement("div");
    divider.className = "inspector-wrapper-divider";
    displayer.conContainer.className = "inspector-wrapper-content-container";
    displayer.content.append(header, divider, displayer.conContainer);
}
function createIcon(display) {
    const icon = document.createElement("div");
    icon.className = "inspector-close-wrapper-icon";
    icon.addEventListener("click", function (e) {
        e.stopPropagation();
        display.close();
    });
    return icon;
}