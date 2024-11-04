const baseUrl = '//119.91.192.119:8089'

const request = ({
	url,
	method,
	data,
}) => {
	return new Promise((resolve, reject) => {
		const token = uni.getStorageSync('token');
		let header = {}
		if (token) {
			header['X-Token'] = token
		}
		uni.request({
			url: `${baseUrl}${url}`,
			data: data,
			method: method || 'GET',
			header: header,
			success: res => {
				console.log(res)
				if (res.data.code == '10000') {
					resolve(res.data)
				} else if (res.statusCode == 401) {
					uni.showToast({
						title: '登录失效',
						icon: "none"
					})
					uni.clearStorageSync()
					setTimeout(() => {
						uni.redirectTo({
							url: '/pages/login/index'
						})
					}, 300)
				} else {
					uni.showToast({
						title: res.data.message,
						icon: "none"
					})
					reject(res)
				}
			},
			fail: res => {
				reject(res)
			}
		})
	});
}
module.exports = {
	request: request,
}