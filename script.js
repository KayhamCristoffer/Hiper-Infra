// Script File

// Inicio Section Starts
var menuBtn = document.querySelector('.main-navbar .menu-btn');
var menuList = document.querySelector('.main-navbar .nav-list');
var menuListItems = document.querySelectorAll('.nav-list li a');

let selectedDifficulty = 'easy'; // Padrão: fácil
const difficultySettings = {
    easy: { count: 10, color: '#2ecc71' },
    normal: { count: 20, color: '#f39c12' },
    hard: { count: 40, color: '#e74c3c' }
};


menuBtn.addEventListener('click', function(){
	menuBtn.classList.toggle('active');
	menuList.classList.toggle('active');
});

for(var i = 0; i < menuListItems.length; i++){
	menuListItems[i].addEventListener('click', menuItemClicked);
}
function menuItemClicked(){
	menuBtn.classList.remove('active');
	menuList.classList.remove('active');
}

var InicioSection = document.querySelector('.Inicio');
window.addEventListener('scroll', pageScrollFunction);
window.addEventListener('load', pageScrollFunction);

function pageScrollFunction(){
	if(window.scrollY > 120){
		InicioSection.classList.add('active');
	}
	else{
		InicioSection.classList.remove('active');
	}
}
// Inicio Section Ends

// Partners Section Starts 
$('.partners-slider').owlCarousel({
    loop:true,
    autoplay:true,
    autoplayTimeout:3000,
    margin:10,
    nav:true,
    navText:["<i class='fa-solid fa-arrow-left'></i>",
             "<i class='fa-solid fa-arrow-right'></i>"],
    responsive:{
        0:{
            items:1
        },
        500:{
            items:2
        },
        700:{
            items:3
        },
        1000:{
        	items:5
        }
    }
})
// Partners Section Ends 

// Contato Section Starts
$('.Contato-slider').owlCarousel({
    loop:true,
    autoplay:true,
    autoplayTimeout:6000,
    margin:10,
    nav:true,
    navText:["<i class='fa-solid fa-arrow-left'></i>",
             "<i class='fa-solid fa-arrow-right'></i>"],
    responsive:{
        0:{
            items:1
        },
        768:{
            items:2
        }
    }
})
// Contato Section Ends

// Evento para o botão Quiz
document.querySelector('.quiz-btn')?.addEventListener('click', function(e) {
    e.preventDefault(); // Evita o comportamento padrão do link (caso o botão seja um <a>)
    window.location.href = "quiz.html"; // Redireciona para a página do quiz
});



