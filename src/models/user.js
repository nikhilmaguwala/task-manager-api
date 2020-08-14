const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique:true,
        required: true,
        trim : true,
        lowercase :true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Invalid Email Address')
            }
        }
    },
    password: {
        type:String,
        required:true,
        minlength:7,
        trim:true,
        validate(value){
            if(value.toLowerCase().includes('password')){
                throw new Error("Password can not contain 'password'")
            }
        }
    },
    age: {
        type: Number,
        default:0,
        validate(value){
            if(value < 0){
                throw new Error('Age must a positive Number')
            }
        }
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }],
    avatar:{
        type:Buffer
    }
},{
    timestamps:true
})

schema.virtual('tasks', {
    ref:'Task',
    localField:'_id',
    foreignField : 'owner'
})

schema.statics.findByCredentials = async (email,password) => {
    const user = await User.findOne({ email })
    if(!user){
        throw new Error('User Not Found')
    }

    const isMatch = await bcrypt.compare(password,user.password)

    if(!isMatch){
        throw new Error('Password is incorrect')
    }

    return user
}

schema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}

schema.methods.generateAuthToken = async function() {
        const user = this
        const token = jwt.sign({ _id:user.id.toString() }, process.env.JWT_SECRET)
        user.tokens = user.tokens.concat({ token })
        await user.save()
        return token
}

schema.pre('save',async function(next){
    const user = this

    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

schema.pre('remove', async function(next) {
    const user = this
    Task.deleteMany({owner:user._id})
    next()
})

const User = mongoose.model('User', schema)

module.exports = User