// 如果存储数组的下标基于0，那么下标为i的节点的子节点是2i+ 1与2i+ 2；其父节点的下标是⌊floor((i− 1) ∕ 2)⌋ 

//最小堆取最小值
class MinHeap {
    constructor (data, compare) {
        this.data = data || [];
        this.compare = compare || ((a, b) => a - b);
    }

    // 在数组的最末尾插入新节点。然后自下而上调整子节点与父节点
    insert (value) {
        this.data.push(value);
        let index = this.data.length - 1;
        let parentIndex = Math.floor((index - 1) / 2);
        
        while (index !== 0) {
            let parentNode = this.data[parentIndex];
            if (this.compare(parentNode, value) > 0) {
                this.data[parentIndex] = value;
                this.data[index] = parentNode;
                index = parentIndex;
                parentIndex = Math.floor((index - 1) / 2);
            } else {
                break;
            }
        }
    }

    // 把堆存储的最后那个节点移到填在根节点处。再从上而下调整父节点与它的子节点
    take () {
        if (this.data.length === 0) return;
        let min = this.data[0];
        let lastIndex = this.data.length - 1;
        this.data[0] = this.data[lastIndex];
        this.data.pop();
        
        let parentIndex = 0;
        let leftIndex = 2*parentIndex + 1;
        let rightIndex = leftIndex + 1;
        
        while (leftIndex < lastIndex) {
            let parentNode = this.data[parentIndex];
            let left = this.data[leftIndex];
            let right = this.data[rightIndex];
            if (right !== (void 0) && (this.compare(right, left) < 0)) {
                if (this.compare(parentNode, right) > 0) {
                    this.data[parentIndex] = right;
                    this.data[rightIndex] = parentNode;
                    parentIndex = rightIndex;
                    leftIndex = 2*parentIndex + 1;
                    rightIndex = leftIndex + 1;
                } else {
                    break;
                }
            } else if (this.compare(left, parentNode) < 0) {
                this.data[parentIndex] = left;
                this.data[leftIndex] = parentNode;
                parentIndex = leftIndex;
                leftIndex = 2*parentIndex + 1;
                rightIndex = leftIndex + 1;
            } else {
                break;
            }
        }
        return min;
    }
}

// let a = new MinHeap();
// a.insert(55);
// a.insert(19);
// a.insert(15);
// a.insert(25);
// a.insert(35);
// a.insert(5);
// a.insert(16);
// a.insert(0);
// a.insert(7);
// a.insert(3);
// a.insert(55);
// a.insert(19);
// a.insert(15);
// a.insert(25);
// a.insert(35);
// a.insert(5);
// a.insert(16);
// a.insert(0);
// a.insert(7);
// a.insert(3);
// a.insert(55);
// a.insert(19);
// a.insert(15);
// a.insert(25);
// a.insert(35);
// a.insert(5);
// a.insert(16);
// a.insert(0);
// a.insert(7);
// a.insert(3);
// a.insert(55);
// a.insert(19);
// a.insert(15);
// a.insert(25);
// a.insert(35);
// a.insert(5);
// a.insert(16);
// a.insert(0);
// a.insert(7);
// a.insert(3);