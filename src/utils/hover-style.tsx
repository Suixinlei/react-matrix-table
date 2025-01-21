let hoverCrossStyle: HTMLStyleElement | null = null;

import './hover-style.css';

export const onCellMouseOver = (e: React.MouseEvent<HTMLDivElement>) => {
  const { currentTarget } = e;
  const { dataset } = currentTarget;
  const classNames = currentTarget.className;
  let { colindex, rowindex } = dataset;
  if (rowindex === -1) {
    // 阻止自定义整列的hover效果
    return;
  }
  if (colindex === '0') {
    colindex = null;
  }
  if (rowindex === '0') {
    rowindex = null;
  }

  let tempStyle = '';
  const skipColHeaderStyleText = ':not([data-rowindex="0"])';
  const colStyle = `
        .data-cell[data-colindex="${colindex}"]${skipColHeaderStyleText},
        .data-cell[data-colindex="${colindex}"]${skipColHeaderStyleText} .col-header-cell-inner {
          background: var(--table-hover-color);
        }
        .data-cell[data-colindex="${colindex}"].data-cell[data-rowindex="0"]::before {
          content: '';
          position: absolute;
          top: 0px;
          left: 0;
          width: 100%;
          height: 2px;
          background: var(--main-color);
        }
        .data-cell[data-rowindex="${rowindex}"] {
          background: var(--table-hover-color);
        }
        .data-cell[data-colindex="0"].data-cell[data-rowindex="${rowindex}"]::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0px;
          width: 2px;
          height: 100%;
          background: var(--main-color);
        }
        .data-cell[data-colindex="${colindex}"].data-cell[data-rowindex="${rowindex}"] .data-cell-inner{
          outline: 1px solid var(--main-color);
        }
        .data-cell[data-colindex="${colindex}"] .no-data {
          background: var(--table-hover-color) !important;
        }
      `;
  const cellStyle = '';
  if (classNames.includes('data-cell')) {
    tempStyle = `
        ${colStyle}
        ${cellStyle}
      `;
  } else if (classNames.includes('col-header')) {
    tempStyle = colStyle;
  }

  if (!hoverCrossStyle) {
    hoverCrossStyle = document.createElement('style');
    hoverCrossStyle.innerHTML = tempStyle;
    document.body.appendChild(hoverCrossStyle);
  } else {
    hoverCrossStyle.innerHTML = tempStyle;
  }
};

export const onTableMouseLeave = () => {
  if (hoverCrossStyle) {
    hoverCrossStyle.innerHTML = '';
  }
};
