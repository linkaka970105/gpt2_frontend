<template>
	<view>
	</view>
</template>

<script>
	import {
		experimentApi
	} from '@/api/api.js'
	export default {
		data() {
			return {}
		},
		onLoad() {
			this.getExperiment()
		},
		methods: {
			getExperiment() {
				const token = uni.getStorageSync('token');
				if (!token) {
					return uni.redirectTo({
						url: '/pages/login/index'
					})
				}
				experimentApi().then(res => {
					console.log(res.experiment)
					if (res.experiment.id == 0) {
						uni.redirectTo({
							url: '/pages/answer/answer'
						})
					} else {
						if (res.experiment.guide_pages && res.experiment.guide_pages.length) {
							uni.redirectTo({
								url: '/pages/test/test'
							})
						} else {
							uni.redirectTo({
								url: '/pages/question/question'
							})
						}
					}
				})
			}
		}
	}
</script>

<style>
</style>