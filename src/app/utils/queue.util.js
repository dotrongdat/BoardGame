class CustomQueue {
    constructor() {
      this.queue = new Array();
      this.map = new Map();
    }
    
    push(element,_id = Date.now()) {
        const index = this.map.get(_id);
        if(index !== undefined){
            this.queue[index].data = element;
        }else{
            this.queue.push({
                _id,
                data: element
            });
            this.map.set(_id,this.queue.length-1);
        }      
    }
    
    dequeue() {
      if (this.isEmpty()) return undefined; //Queue is empty
      
      const item = this.queue.shift();
      this.map.delete(item._id)
      return item;
    }
    
    peek() {
      if (this.isEmpty()) return undefined; //Queue is empty
      return this.queue[0]
    }
    
    find(_id){
        const index = this.map.get(_id);
        if(index !== undefined) return this.queue[index];
        return undefined;
    }

    update(_id,data){
        const index = this.map.get(_id);
        if(index !== undefined) {
            this.queue[index].data = data;
            return true;
        }
        return false;
    }

    delete(_id){
        const index = this.map.get(_id);
        if(index !== undefined){
            this.queue = this.queue.slice(0,index).concat(this.queue.slice(index+1));
            this.map.delete(_id);
            return true;
        }
        return false;
    }

    isEmpty() {
      return !this.queue.length
    }
    

    // isFull() {
    //   return this.size === this.capacity;
    // }
  }

export default CustomQueue;