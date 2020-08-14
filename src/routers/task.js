const express = require('express')
const Task = require('../models/task')
const auth = require('../middleware/auth')
const { translateAliases } = require('../models/task')
const router = new express.Router()

router.post('/tasks', auth , async (req,res) => {
    const task = new Task({
        ...req.body,
        owner:req.user._id
    })

    try{
        await task.save()
        res.status(201).send(task)
    }catch (e) {
        res.status(400).send(e)
    }

})

router.get('/tasks/:id', auth , async (req,res) => {
    const _id = req.params.id
    try{
        const task = await Task.findOne({_id,owner: req.user._id})        
        if(!task){
            return res.status(404).send('No Task found')
        }
        res.status(200).send(task)
    }catch (e) {
        res.status(500).send(e)
    }
})

router.get('/tasks', auth , async (req,res) => {
    req.query.completed
    const match = {}
    const sort = {}
    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = (parts[1] === 'desc' ? 1 : -1 ) 
    }
    if(req.query.completed) {
        match.completed = req.query.completed === 'true'
    }
    try{
        await req.user.populate({
            path:'tasks',
            match,
            options:{
                limit:parseInt(req.query.limit),
                skip:parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.status(201).send(req.user.tasks)
    }catch (e) {
        res.status(400).send(e)
    }
})

router.patch('/tasks/:id', auth , async (req,res) => {
    const _id = req.params.id
    const Updates = Object.keys(req.body)
    const allowUpdates  = ['description','completed']
    const isValidOp = Updates.every((update) => {
        return allowUpdates.includes(update)
    })
    
    if(!isValidOp) {
        return res.status(400).send({ error : 'invalid Update !'})
    }

    try{
        const task = await Task.findOne({_id,owner:req.user._id})

        if(!task){
            return res.status(404).send('No User Found to Update')
        }
        
        Updates.forEach(() => {
            task[update] = req.body[update]
        })
        await task.save()
        res.send(task)
    }catch(e) {
        res.status(400).send(e)
    }
})

router.delete('/tasks/:id', auth , async (req,res) => {
    try{
        const task = await Task.findOneAndDelete({_id:req.params.id,owner:req.user._id}) 
        if(!task){
            return res.send(404).send('Task Not Found')
        }
        res.send(200).send(task)
    }catch (e) {
        res.send(500).send(e)
    }
})

module.exports = router