"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Stack = void 0;
var Stack = /** @class */ (function () {
    function Stack() {
        this.m_Stack = new Array();
    }
    Stack.prototype.AccessIndex = function () {
        return 0;
    };
    Stack.prototype.Push = function (el) {
        this.m_Stack.push(el);
    };
    Stack.prototype.Peek = function () {
        var item = null;
        if (this.m_Stack.length > 0) {
            var index = this.AccessIndex();
            item = this.m_Stack[index];
        }
        return item;
    };
    Stack.prototype.Pop = function () {
        var item = null;
        if (this.m_Stack.length > 0) {
            var index = this.AccessIndex();
            item = this.m_Stack[index];
            this.m_Stack.splice(index, 1);
        }
        return item;
    };
    return Stack;
}());
exports.Stack = Stack;
