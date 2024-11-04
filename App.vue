<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style>
	/*每个页面公共css */
	@import "@/static/css/index.scss";

	/* .el-card{
		filter: invert(1) hue-rotate(180deg);
	} */
	li{
		line-height: 1.8;
	}
	
	p{
		line-height: 1.4;
		margin: 10px 0;
	}
</style>