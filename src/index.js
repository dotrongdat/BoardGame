import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import { config } from '../configs/config.js'
import morgan from 'morgan'
import db from './db/db.js'
import route from './routes/index.js'
import cors from 'cors'
import { roles } from './constants/credential.constant.js'
// import {createClient} from 'redis';
import helmet from 'helmet'
import { createStream } from 'rotating-file-stream'
import { join, dirname } from 'path'
import Queue from './app/utils/queue.util.js'
import { createConservation } from './app/controllers/api/message.controller.js'
import { matchOrderToSpecificAdminUser } from './app/controllers/api/order.controller.js'
import _ from 'lodash'
import nodeCache from 'node-cache'
import 'dotenv/config'

const app = express()
const myCache = new nodeCache({ stdTTL: 100, checkperiod: 120 })
myCache.flushAll()
global.nodeCache = myCache
const port = process.env.PORT || config.port
const hostname = process.env.HOSTNAME || config.hostname.localhost

const isProduction = process.env.NODE_ENV === 'production'

const socketIoServer = new Server()

db()
const server = http.createServer(app)
app.use(cors())
app.use(helmet())
app.use(express.json())
app.use(express.raw())
app.use(express.urlencoded({ extended: false }))

const accessLogStream = createStream('access.log', {
	interval: '1d',
	path: join(dirname(''), 'log'),
})
app.use(
	isProduction ? morgan('combined', { stream: accessLogStream }) : morgan('dev')
)

route(app)

const io = socketIoServer.attach(server, { cors: { origin: '*' } })
global.io = io
io.sockets.adapter.rooms.get('admin')
io.on('connection', (socket) => {
	socket.emit('connected')
	socket.join(socket.id)
	socketBasicMap.set(socket.id, {})
	socket.on('syncSignIn', ({ user, socketID }) => {
		socketID.forEach((sk) => io.to(sk).emit('signIn', user))
	})
	socket.on('syncSignOut', (socketID) => {
		socketID.forEach((sk) => io.to(sk).emit('signOut'))
	})
	socket.on('signIn', (user) => {
		socket.join(user._id)
		socketBasicMap.set(socket.id, { user })
		switch (user.role) {
			case roles.CUSTOMER:
				break
			case roles.ADMIN:
				if (messageBasicQueue.peek()) {
					const { data } = messageBasicQueue.peek()
					createConservation(
						[data.user._id, user._id],
						data.user._id,
						data.message
					).then(() => messageBasicQueue.dequeue())
				}
				if (orderBasicQueue.peek()) {
					const { data } = orderBasicQueue.peek()
					matchOrderToSpecificAdminUser(data, user._id).then(() =>
						orderBasicQueue.dequeue()
					)
				}
				const result = socketAdminBasicQueue.find(user._id)
				if (result) {
					let sockets = result.data
					socketAdminBasicQueue.update(user._id, [...sockets, socket.id])
				} else {
					socketAdminBasicQueue.push([socket.id], user._id)
				}
				socket.join('admin')
				break
			default:
				break
		}
	})
	socket.on('signOut', (user) => {
		socketBasicMap.set(socket.id, {})
		if (user.role === roles.ADMIN) {
			const result = socketAdminBasicQueue.find(user._id)
			if (result) {
				let sockets = result.data
				sockets = sockets.filter((_socket) => _socket.id !== socket.id)
				_.isEmpty(sockets)
					? socketAdminBasicQueue.delete(user._id)
					: socketAdminBasicQueue.update(user._id, sockets)
			}
		}
		socket.rooms.forEach((room) => {
			if (room !== socket.id) socket.leave(room)
		})
	})
	socket.on('disconnect', () => {
		const { user } = socketBasicMap.get(socket.id)
		if (user && socket.rooms.has('admin')) {
			const result = socketAdminBasicQueue.find(user._id)
			if (result) {
				let sockets = result.data
				sockets = sockets.filter((_socket) => _socket.id !== socket.id)
				_.isEmpty(sockets)
					? socketAdminBasicQueue.delete(user._id)
					: socketAdminBasicQueue.update(user._id, sockets)
			}
		}
		socketBasicMap.delete(socket.id)
	})
})

const socketAdminBasicQueue = new Queue()
const socketBasicMap = new Map()
const orderBasicQueue = new Queue()
const messageBasicQueue = new Queue()

global.socketAdminBasicQueue = socketAdminBasicQueue
global.orderBasicQueue = orderBasicQueue
global.messageBasicQueue = messageBasicQueue

//startRedisClient();
server.listen(port, () => {
	console.log(`Server is listening from ${hostname}:${port}`)
})
