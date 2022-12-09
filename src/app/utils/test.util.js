import validator from 'validator';
class Validation {
    constructor(str) {
        this.isValid = true;
        this.allowContinueValidation = true;
        this.str = str;
        this.errors = [];
    }
}

function assignValues(obj, values) {
    for (let property in values) {
        const value=values[property];
        if (value != undefined) {
            if (Array.isArray(obj[property]))
                obj[property] = [...obj[property], value];
            else obj[property] = value;
        }
    }
}

function assignError(obj, errors) {
    const values = {
        isValid: false,
        errors
    };
    assignValues(obj, values)
}
Validation.prototype.notEmpty = function (error,optional={ignore_whitespace:false}) {
    if (this.allowContinueValidation && validator.isEmpty(this.str,optional)) {
        assignError(this, error);
    }
    return this;
}
Validation.prototype.exist=function (error){
    if (this.allowContinueValidation && this.str==undefined) {
        assignError(this, error);
        this.bail();
    }
    return this;
}
Validation.prototype.min = function (value,error){
    if(this.allowContinueValidation){
        let isValid=true;
        isValid = validator.isNumeric(this.str) ? this.str >= value : this.str.length >= value;
        if(!isValid) assignError(this,error);
    }
    return this;
}
Validation.prototype.max = function (value,error){
    if(this.allowContinueValidation){
        let isValid=true;
        isValid = validator.isNumeric(this.str) ? this.str <= value : this.str.length <= value;
        if(!isValid) assignError(this,error);
    }
    return this;
}
Validation.prototype.gt = function (value,error){
    if(this.allowContinueValidation){
        let isValid=true;
        isValid = validator.isNumeric(this.str) ? this.str > value : this.str.length > value;
        if(!isValid) assignError(this,error);
    }
    return this;
}
Validation.prototype.lt = function (value,error){
    if(this.allowContinueValidation){
        let isValid=true;
        isValid = validator.isNumeric(this.str) ? this.str < value : this.str.length < value;
        if(!isValid) assignError(this,error);
    }
    return this;
}
// Validation.prototype.withMessage=function (message){

// }
Validation.prototype.bail = function () {
    this.allowContinueValidation = this.isValid;
    return this;
}

Validation.prototype.custom = function (fn,error) {
    if (this.allowContinueValidation && fn(this.str) === false) {
        assignError(this, error);
    }
    return this;
}

Validation.prototype.validate= function (obj){
    
        obj.isValid= this.isValid
        obj.errors= this.errors.filter((error)=>!validator.isEmpty(error,{ignore_whitespace:true}))
}

export default function (str) {
    return new Validation(str);
};