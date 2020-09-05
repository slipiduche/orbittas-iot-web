jQuery(document).ready(function($){
	$("html").niceScroll({
		cursorcolor:"rgba(255,255,255,0.2)",
		cursorborder:"1px solid rgba(0,0,0,0.1)",
		scrollspeed:100,
		autohidemode:false,
		cursorwidth:13,
		zindex:9999999,
		cursorborderradius:0,
		railpadding:{right:4}
	});
	$("#btn-subir").hide();
		$(function () {
			$(window).scroll(function () {
				if ($(this).scrollTop() > 200) {
					$("#btn-subir").fadeIn();
				} else {
					$("#btn-subir").fadeOut();
				}
			});
			$("#btn-subir").click(function () {
				$("body,html").animate({
					"scrollTop": 0
				}, 1000);
				return false;
			});
		});

});
$(document).on('click', 'a[href^="#"]', function (event) {
	event.preventDefault();

	$('html, body').animate({
		scrollTop: $($.attr(this, 'href')).offset().top
		}, 500);
});

const $burger = document.getElementById('burger')
const $nav = document.getElementById('nav')
const $header = document.getElementById('header')

$burger.addEventListener('click', function () {
	$nav.classList.toggle('active');
	$header.classList.toggle('active');
})