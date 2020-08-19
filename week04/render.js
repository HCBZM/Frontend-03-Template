const images = require('images');

function render(viewport, element) {
    if (element.css) {
        let css = element.css
        let img = images(css.width, css.height);

        let bgColor = css['background-color'] || 'rgb(0, 0, 0)';
        bgColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        img.fill(Number(RegExp.$1), Number(RegExp.$2), Number(RegExp.$3));

        viewport.draw(img, css.left || 0, css.top || 0);
    }

    if (element.children) {
        for (let child of element.children) {
            render(viewport, child);
        }
    }
}

module.exports = render;