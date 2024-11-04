import {
	request
} from '@/util/request.js'

export const loginApi = (data) => {
	return request({
		url: '/api/account/login',
		method: 'POST',
		data
	})
}

export const experimentApi = (data) => {
	return request({
		url: '/api/experiment',
		data
	})
}

export const chatApi = (data) => {
	return request({
		url: '/api/chat',
		method: 'POST',
		data
	})
}

export const answerApi = (data) => {
	return request({
		url: '/api/experiment/answer',
		method: 'POST',
		data
	})
}

export const answerQuestionApi = (data) => {
	return request({
		url: '/api/questionnaire/answer',
		method: 'POST',
		data
	})
}




