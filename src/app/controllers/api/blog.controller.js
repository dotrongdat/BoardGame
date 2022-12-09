import Blog from '../../models/blog.js'
import {
	deleteFileFromFirebase,
	uploadFileToFireBase,
} from '../../utils/firebase.util.js'

const getAll = async (req, res) => {
	try {
		let blogs = global.nodeCache.get('blogs')
		if (!blogs) {
			blogs = await Blog.find({ status: true }).lean()
			global.nodeCache.set('blogs', blogs)
		}
		const payload = { blogs }
		return res.status(200).json({
			message: 'Get all blogs successfully',
			payload,
		})
	} catch (error) {
		return res.status(500).json({
			message: 'Error',
		})
	}
}

const create = async (req, res) => {
	try {
		const { payload, file, user } = req
		const { title, content, source } = req.body

		const fileName =
			new Date().getTime().toString() + '.' + file.originalname.split('.').pop()

		const blog = await Blog.create({
			title,
			content,
			image: await uploadFileToFireBase(file, fileName),
			writer: user._id,
			source,
			status: true,
		})
		payload.blog = blog
		let blogs = global.nodeCache.get('blogs')
		if (blogs) {
			blogs.push(blog)
			global.nodeCache.set('blogs', blogs)
		}
		return res.status(200).json({
			message: 'Create blog successfully',
			payload,
		})
	} catch (error) {
		return res.status(500).json({
			message: 'Error',
		})
	}
}

const update = async (req, res) => {
	try {
		const { payload, file } = req
		const { _id, title, content, source } = req.body
		let updateData = { title, content, source }

		if (file) {
			const fileName =
				new Date().getTime().toString() +
				'.' +
				file.originalname.split('.').pop()
			updateData.image = await uploadFileToFireBase(file, fileName)
		}

		let blog = await Blog.findById(_id)
		deleteFileFromFirebase(blog.image)
		for (let property in updateData) {
			blog[property] = updateData[property]
		}
		await blog.save()
		payload.blog = blog

		let blogs = global.nodeCache.get('blogs')
		if (blogs) {
			const index = blogs.findIndex((i) => i._id === _id)
			if (index > -1) {
				blogs[index] = blog
				global.nodeCache.set('blogs', blogs)
			}
		}
		return res.status(200).json({
			message: 'Update blog successfully',
			payload,
		})
	} catch (error) {
		return res.status(500).json({
			message: 'Error',
		})
	}
}

const deleteBlog = async (req, res) => {
	try {
		const { payload } = req
		let { _id } = req.body

		if (!Array.isArray(_id)) {
			_id = [_id]
		}

		await Blog.updateMany({ _id: { $in: _id } }, { status: false }).lean()

		let blogs = global.nodeCache.get('blogs')
		if (blogs) {
			blogs = blogs.filter((blog) => !_id.includes(blog._id.toString()))
			global.nodeCache.set('blogs', blogs)
		}

		return res.status(200).json({
			message: 'Remove blog successfully',
			payload,
		})
	} catch (error) {
		return res.status(500).json({
			message: 'Error',
		})
	}
}

export default {
	getAll,
	create,
	update,
	deleteBlog,
}
