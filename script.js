const menuButton=document.querySelector('.menu-btn');
const nav=document.querySelector('#nav');
menuButton.addEventListener('click',()=>{const open=nav.classList.toggle('open');menuButton.setAttribute('aria-expanded',String(open))});
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menuButton.setAttribute('aria-expanded','false')}));

document.querySelectorAll('.filters button').forEach(button=>button.addEventListener('click',()=>{
  document.querySelector('.filters .active').classList.remove('active');button.classList.add('active');
  const filter=button.dataset.filter;
  document.querySelectorAll('.project-card').forEach(card=>card.classList.toggle('hidden',filter!=='all'&&card.dataset.category!==filter));
}));

const formatter=new Intl.NumberFormat('pl-PL');
function calculate(){
  const length=Number(document.querySelector('#length').value);
  const layout=Number(document.querySelector('[name=layout]:checked').value);
  const finish=Number(document.querySelector('[name=finish]:checked').value);
  const base=Math.round((10500+length*4800*layout)*finish/1000)*1000;
  document.querySelector('#length-output').textContent=length.toFixed(1).replace('.',',')+' m';
  document.querySelector('#price-result').textContent=`${formatter.format(base)} – ${formatter.format(Math.round(base*1.24/1000)*1000)} zł`;
}
document.querySelectorAll('#calc-form input').forEach(input=>input.addEventListener('input',calculate));

document.querySelectorAll('.accordion button').forEach(button=>button.addEventListener('click',()=>{
  const article=button.closest('article');const wasOpen=article.classList.contains('open');
  document.querySelectorAll('.accordion article').forEach(item=>{item.classList.remove('open');item.querySelector('button').setAttribute('aria-expanded','false');item.querySelector('i').textContent='+'});
  if(!wasOpen){article.classList.add('open');button.setAttribute('aria-expanded','true');button.querySelector('i').textContent='−'}
}));

document.querySelector('#contact-form').addEventListener('submit',event=>{
  event.preventDefault();const toast=document.querySelector('#toast');toast.classList.add('show');event.target.reset();setTimeout(()=>toast.classList.remove('show'),4200);
});

const header=document.querySelector('.site-header');
window.addEventListener('scroll',()=>{const scrolled=scrollY>80;header.style.position=scrolled?'fixed':'absolute';header.style.background=scrolled?'rgba(20,31,25,.96)':'transparent';header.style.backdropFilter=scrolled?'blur(12px)':'none'} ,{passive:true});
