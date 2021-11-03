import * as React from "react";
import * as ReactDOM from "react-dom";
import { DragDrop } from ".";
import TabNode from "./model/TabNode";
import { CLASSES } from "./Types";

/** @hidden @internal */
export function showPopup(
    layoutDiv: HTMLDivElement,
    triggerElement: Element,
    items: { index: number; node: TabNode }[],
    onSelect: (item: { index: number; node: TabNode }) => void,
    classNameMapper: (defaultClassName: string) => string
) {
    const currentDocument = triggerElement.ownerDocument;
    const triggerRect = triggerElement.getBoundingClientRect();
    const layoutRect = layoutDiv.getBoundingClientRect();

    const elm = currentDocument.createElement("div");
    elm.className = classNameMapper(CLASSES.FLEXLAYOUT__POPUP_MENU_CONTAINER);
    if (triggerRect.left < layoutRect.left + layoutRect.width / 2) {
        elm.style.left = triggerRect.left - layoutRect.left + "px";
    } else {
        elm.style.right = layoutRect.right - triggerRect.right + "px";
    }

    if (triggerRect.top < layoutRect.top + layoutRect.height / 2) {
        elm.style.top = triggerRect.top - layoutRect.top + "px";
    } else {
        elm.style.bottom = layoutRect.bottom - triggerRect.bottom + "px";
    }
    DragDrop.instance.addGlass(() => onHide());
    DragDrop.instance.setGlassCursorOverride("default");

    layoutDiv.appendChild(elm);

    const onHide = () => {
        DragDrop.instance.hideGlass();
        layoutDiv.removeChild(elm);
        ReactDOM.unmountComponentAtNode(elm);
        elm.removeEventListener("mousedown", onElementMouseDown);
        currentDocument.removeEventListener("mousedown", onDocMouseDown);
    };

    const onElementMouseDown = (event: Event) => {
        event.stopPropagation();
    };

    const onDocMouseDown = (event: Event) => {
        onHide();
    };

    elm.addEventListener("mousedown", onElementMouseDown);
    currentDocument.addEventListener("mousedown", onDocMouseDown);

    ReactDOM.render(<PopupMenu
        currentDocument={currentDocument}
        onSelect={onSelect}
        onHide={onHide}
        items={items}
        classNameMapper={classNameMapper}
    />, elm);
}

/** @hidden @internal */
interface IPopupMenuProps {
    items: { index: number; node: TabNode }[];
    currentDocument: Document;
    onHide: () => void;
    onSelect: (item: { index: number; node: TabNode }) => void;
    classNameMapper: (defaultClassName: string) => string;
}

/** @hidden @internal */
const PopupMenu = (props: IPopupMenuProps) => {
    const { items, onHide, onSelect, classNameMapper } = props;

    const onItemClick = (item: { index: number; node: TabNode }, event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        onSelect(item);
        onHide();
        event.stopPropagation();
    };

    const itemElements = items.map((item, i) => (
        <div key={item.index}
            className={classNameMapper(CLASSES.FLEXLAYOUT__POPUP_MENU_ITEM)}
            data-layout-path={"/popup-menu/tb" + i}
            onClick={(event) => onItemClick(item, event)}
            title={item.node.getHelpText()}>
            {item.node._getRenderedName()}
        </div>
    ));

    return (
        <div className={classNameMapper(CLASSES.FLEXLAYOUT__POPUP_MENU)}
        data-layout-path="/popup-menu"
        >
            {itemElements}
        </div>);
};
