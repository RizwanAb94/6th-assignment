const categoriesEl = document.getElementById('categories');
const plantsContainer = document.getElementById('plants-container');
const spinnerEl = document.getElementById('spinner');
const cartItemsEl = document.getElementById('cart-items');
const totalEl = document.getElementById('total');
const currentCategoryEl = document.getElementById('current-category');
const resultCountEl = document.getElementById('result-count');

const modal = document.getElementById('modal');
const modalImg = document.getElementById('modal-img');
const modalTitle = document.getElementById('modal-title');
const modalDesc = document.getElementById('modal-desc');
const modalClose = document.querySelector('.modal-close');


let cart = [];
let activeCategoryId = null;
let activeCategoryName = 'All Trees';

/* ---------- Helpers ---------- */
function showSpinner(){ if(spinnerEl) spinnerEl.style.display='block'; }
function hideSpinner(){ if(spinnerEl) spinnerEl.style.display='none'; }
function num(val){ return Number(val)||0; }
function esc(str){ 
  if(str===undefined||str===null) return ''; 
  return String(str).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); 
}
function safeImage(src){ return src || 'https://dummyimage.com/300x200/cccccc/000000&text=No+Image'; }

/* ---------- Categories ---------- */
async function loadCategories(){
  showSpinner();
  try{
    const res = await fetch('https://openapi.programming-hero.com/api/categories');
    const data = await res.json();
    renderCategories((data && data.categories) ? data.categories : []);
  }catch(err){ 
    console.error(err); 
    renderCategories([]); 
  }finally{ 
    hideSpinner(); 
  }
}

function renderCategories(categories){
  categoriesEl.innerHTML = '';

  const allBtn = document.createElement('button');
  allBtn.innerHTML = `<span class="cat-dot"></span><span>All</span>`;
  allBtn.classList.toggle('active', activeCategoryId===null);
  allBtn.addEventListener('click', ()=>{ 
    activeCategoryId=null; activeCategoryName='All Trees'; 
    setActiveButton(allBtn); 
    loadAllPlants(); 
  });
  categoriesEl.appendChild(allBtn);

  categories.forEach(cat=>{
    const catName = cat.category_name || cat.name || 'Unnamed';
    const btn = document.createElement('button');
    btn.innerHTML = `<span class="cat-dot"></span><span>${esc(catName)}</span>`;
    btn.addEventListener('click', ()=>{ 
      activeCategoryId = cat.id; 
      activeCategoryName = catName; 
      setActiveButton(btn); 
      loadPlantsByCategory(cat.id); 
    });
    categoriesEl.appendChild(btn);
  });
}

function setActiveButton(activeBtn){
  document.querySelectorAll('#categories button').forEach(b=>b.classList.remove('active'));
  activeBtn.classList.add('active');
  currentCategoryEl.textContent = activeCategoryName || 'All Trees';
}

/* ---------- Plants ---------- */
async function loadAllPlants(){
  plantsContainer.innerHTML=''; 
  resultCountEl.textContent='';
  showSpinner();
  try{
    const res = await fetch('https://openapi.programming-hero.com/api/plants');
    const data = await res.json();
    renderPlants(data.plants || []);
  }catch(err){ 
    console.error(err); 
    plantsContainer.innerHTML=`<div>No plants available.</div>`; 
    resultCountEl.textContent='0 items';
  }finally{ 
    hideSpinner();
  }
}

async function loadPlantsByCategory(id){
  if(!id){ loadAllPlants(); return; }
  plantsContainer.innerHTML=''; 
  resultCountEl.textContent='';
  showSpinner();
  try{
    const res = await fetch(`https://openapi.programming-hero.com/api/category/${id}`);
    const data = await res.json();
    renderPlants(data.plants || []);
  }catch(err){ 
    console.error(err); 
    plantsContainer.innerHTML=`<div>No plants in this category.</div>`; 
    resultCountEl.textContent='0 items';
  }finally{ 
    hideSpinner();
  }
}

function renderPlants(plants){
  plantsContainer.innerHTML='';
  if(!plants || plants.length===0){ 
    resultCountEl.textContent='0 items'; 
    plantsContainer.innerHTML='<div>No trees available.</div>'; 
    return; 
  }
  resultCountEl.textContent = `${plants.length} items`;

  plants.forEach(p=>{
    const name = p.name || p.plant_name || 'Unnamed Plant';
    const shortDesc = p.short_description || p.description || 'No description available.';
    const image = safeImage(p.image || p.thumbnail || p.img || p.plant_image || p.picture || p.image_url);
    const category = p.category||p.category_name||activeCategoryName||'Uncategorized';
    const price = num(p.price)||num(p.default_price)||(p.id?(Number(p.id)%5+1)*100:150);

    const card = document.createElement('article');
    card.className='card';
    card.innerHTML=`
      <img src="${image}" alt="${esc(name)}" onerror="this.src='https://dummyimage.com/300x200/cccccc/000000&text=No+Image'">
      <h4 class="plant-name" data-id="${esc(p.id)}" tabindex="0">${esc(name)}</h4>
      <p class="plant-desc">${esc(shortDesc)}</p>
      <div><span class="category-pill">${esc(category)}</span></div>
      <div class="price">৳${price}</div>
      <button class="add-cart" data-id="${esc(p.id)}" data-price="${price}" data-name="${esc(name)}">Add to Cart</button>
    `;

    const nameEl = card.querySelector('.plant-name');
    nameEl.addEventListener('click',()=>openPlantModal(p.id));
    nameEl.addEventListener('keypress',e=>{if(e.key==='Enter') openPlantModal(p.id);});

    const addBtn = card.querySelector('.add-cart');
    addBtn.addEventListener('click',()=>{addToCart({id:p.id||Date.now(), name, price, image});});

    plantsContainer.appendChild(card);
  });
}
/* ---------- Init ---------- */
document.addEventListener('DOMContentLoaded',()=>{
  loadCategories(); 
  loadAllPlants();
});
