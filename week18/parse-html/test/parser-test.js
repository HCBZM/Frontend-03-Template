const assert = require('assert'); 
import {HTMLparser} from '../src/parser.js' 

describe('html-parser-test', function() {

    it('<a></a>', function() {
        let tree = HTMLparser('<a></a>');
        assert.equal(tree.children[0].children.length, 0);
    });

    it('<a>123</a>', function() {
        let tree = HTMLparser('<a>123</a>');
        assert.equal(tree.children[0].children[0].content, '123');
    });

    it('<a class="a1" id=\'b\' disabled o=o></a>', function() {
        let tree = HTMLparser('<a class="a1" id=\'b\' disabled o=o></a>');
        let attributes = tree.children[0].attributes;
        assert.equal(attributes.length, 4);
    });

    it('<a />', function() {
        let tree = HTMLparser('<a />');
        assert.equal(tree.children.length, 1);
    });

    it('<a class=\'a\'/>', function() {
        let tree = HTMLparser('<a class=\'a\'/>');
        let attributes = tree.children[0].attributes;
        assert.equal(attributes.length, 1);
    });

    it('<a class=\'a\'></a>', function() {
        let tree = HTMLparser('<a class=\'a\'></a>');
        let attributes = tree.children[0].attributes;
        assert.equal(attributes.length, 1);
    });

    it('<a disabled=></a>', function() {
        let tree = HTMLparser('<a disabled=></a>');
        let attributes = tree.children[0].attributes;
        assert.equal(attributes.length, 1);
    });

    it('<a class=a ></a>', function() {
        let tree = HTMLparser('<a class=a ></a>');
        let attributes = tree.children[0].attributes;
        assert.equal(attributes.length, 1);
    });

    it('<a     class=a ></a>', function() {
        let tree = HTMLparser('<a     class=a ></a>');
        let attributes = tree.children[0].attributes;
        assert.equal(attributes.length, 1);
    });

    it('<a class= aaaa ></a>', function() {
        let tree = HTMLparser('<a class= aaaa ></a>');
        let attributes = tree.children[0].attributes;
        assert.equal(attributes.length, 1);
    });

    it('<a class =aaaa ></a>', function() {
        let tree = HTMLparser('<a class =aaaa ></a>');
        let attributes = tree.children[0].attributes;
        assert.equal(attributes.length, 1);
    });

    it('<a/>', function() {
        let tree = HTMLparser('<a/>');
        assert.equal(tree.children.length, 1);
    });
});
