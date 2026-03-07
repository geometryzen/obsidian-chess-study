class QNode<T> {
	data: T;
	next: QNode<T> | null;
	constructor(data: T) {
		this.data = data;
		this.next = null;
	}
}

// Custom Queue implementation
export class Queue<T> {
	front: QNode<T> | null;
	rear: QNode<T> | null;
	constructor() {
		this.front = null;
		this.rear = null;
	}

	isEmpty(): boolean {
		return this.front === null;
	}

	enqueue(x: T): void {
		const newNode = new QNode(x);
		if (this.rear === null) {
			this.front = this.rear = newNode;
			return;
		}
		this.rear.next = newNode;
		this.rear = newNode;
	}

	dequeue(): T | null {
		if (this.front === null) return null;

		const temp = this.front;
		this.front = this.front.next;

		if (this.front === null) this.rear = null;

		return temp.data;
	}
}
