/* KosSapa • UTS Pemrograman Web 2026/2027 • Gerald Bimo 25091397066
 * Fetch Ajax untuk navigasi; localStorage untuk data. Tanpa PHP, API, dan Bootstrap.
 */
(() => {
  'use strict';
  const pageMap = {
    beranda: ['pages/beranda.html','Beranda'],
    ulasan: ['pages/ulasan.html','Ulasan Kos'],
    tulis: ['pages/tulis.html','Tulis Ulasan'],
    lapor: ['pages/lapor.html','Laporkan Kos'],
    riwayat: ['pages/riwayat.html','Riwayat Laporan']
  };
  const store = window.KosSapaStore;
  const el = id => document.getElementById(id);
  const main = el('pageContent');
  const dialog = el('detailDialog');
  const state = {kos:[], ulasan:[], laporan:[], token:0, filters:{}};
  const esc = s => String(s ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const shorten = (s,n) => String(s).length > n ? String(s).slice(0,n).trimEnd() + '…' : String(s);
  const dateString = s => /^\d{4}-\d{2}-\d{2}$/.test(String(s)) ? new Intl.DateTimeFormat('id-ID',{day:'numeric',month:'short',year:'numeric',timeZone:'Asia/Jakarta'}).format(new Date(s+'T12:00:00+07:00')) : '—';
  const currentDate = () => new Intl.DateTimeFormat('id-ID',{day:'numeric',month:'long',year:'numeric',timeZone:'Asia/Jakarta'}).format(new Date());
  const kosName = id => state.kos.find(k=>Number(k.id_kos)===Number(id))?.nama_kos ?? 'Kos tidak diketahui';
  const category = id => ({dugaan_penipuan:'Dugaan penipuan',ketidaksesuaian:'Informasi tidak sesuai',keamanan:'Keamanan',pelayanan:'Pelayanan',lainnya:'Lainnya'})[id] || 'Lainnya';
  const stars = n => `<span class="star-line" aria-label="${Number(n)} dari 5 bintang">${'★'.repeat(Math.min(5,Math.max(0,Number(n))))}<span class="star-muted">${'★'.repeat(Math.max(0,5-Number(n)))}</span></span>`;

  function menu(open) {
    el('sidebar').classList.toggle('open',open);
    el('sidebarOverlay').hidden=!open;
    el('menuToggle').setAttribute('aria-expanded',String(open));
  }
  el('menuToggle').addEventListener('click',()=>menu(!el('sidebar').classList.contains('open')));
  el('menuClose').addEventListener('click',()=>menu(false));
  el('sidebarOverlay').addEventListener('click',()=>menu(false));
  document.addEventListener('keydown',e=>{if(e.key==='Escape')menu(false);});
  document.addEventListener('click',e=>{
    if(e.target.closest('[data-page]'))menu(false);
    const detail = e.target.closest('[data-detail-id]');
    if(detail)openReport(Number(detail.dataset.detailId));
    if(e.target.closest('.retry-button'))void loadPage();
  });
  el('dialogClose').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
  function toast(message,error=false){
    const item=document.createElement('div');
    item.className='toast'+(error?' error':'');
    const sign=document.createElement('span');sign.textContent=error?'!':'✓';
    const copy=document.createElement('span');copy.textContent=message;
    item.append(sign,copy);el('toastRegion').append(item);setTimeout(()=>item.remove(),5000);
  }
  function errorCard(err){return `<div class="records-empty"><div class="empty-art">!</div><strong>Gagal memuat data</strong><p>${esc(err?.message || err)}</p><button type="button" class="btn btn-ghost retry-button">Coba lagi</button></div>`;}
  async function request(action,payload) {
    // Penyimpanan data lokal; tidak mengirim permintaan HTTP POST ke server.
    return store.perform(action,payload);
  }
  async function fetchAll(){
    const [kos,ulasan,laporan]=await Promise.all([request('kos'),request('ulasan'),request('laporan')]);
    state.kos=kos;state.ulasan=ulasan;state.laporan=laporan;
  }
  function selectKos(id,placeholder='Pilih nama kos...'){
    const node=el(id);if(!node)return;
    node.innerHTML=`<option value="">${esc(placeholder)}</option>`+state.kos.map(k=>`<option value="${Number(k.id_kos)}">${esc(k.nama_kos)}</option>`).join('');
  }
  function reviewCard(r){
    return `<article class="review-card"><div class="review-top"><span class="review-kos">⌂ ${esc(kosName(r.id_kos))}</span><span class="review-date">${esc(dateString(r.tanggal))}</span></div><div class="review-stars">${stars(r.rating)}<strong>${Number(r.rating)}.0</strong></div><p class="review-copy">${esc(r.isi_ulasan)}</p><div class="review-foot"><div class="review-avatar">${esc(String(r.nama_penulis).slice(0,1).toUpperCase())}</div><strong>${esc(r.nama_penulis)}</strong><span class="foot-tag">Ulasan demo</span></div></article>`;
  }
  function reportCard(r){
    return `<article class="report-card"><span class="report-icon">!</span><div class="report-main"><div class="report-metadata"><span>#LPR-${String(r.id_laporan).padStart(3,'0')}</span><span class="meta-divider"></span><span>${esc(dateString(r.tanggal))}</span></div><strong class="report-title">${esc(r.judul)}</strong><p class="report-description">${esc(kosName(r.id_kos))} · ${esc(category(r.kategori))}</p><div class="report-actions"><button type="button" class="detail-button" data-detail-id="${Number(r.id_laporan)}">Lihat detail →</button><span class="status-badge status-baru">Menunggu Verifikasi</span></div></div></article>`;
  }
  function recentRow(r){return `<div class="recent-item"><span class="recent-icon">★</span><span class="recent-copy"><strong>${esc(kosName(r.id_kos))}</strong><small>${esc(shorten(r.isi_ulasan,78))}</small></span><span class="recent-end">${stars(r.rating)}</span></div>`;}

  async function loadPage(){
    const page=location.hash.slice(1)||'beranda';
    const chosen=pageMap[page]?page:'beranda';const token=++state.token;
    menu(false);
    document.querySelectorAll('.nav-link').forEach(a=>{
      const active=a.dataset.page===chosen;
      a.classList.toggle('active',active);
      if(active)a.setAttribute('aria-current','page'); else a.removeAttribute('aria-current');
    });
    el('breadcrumb').textContent=pageMap[chosen][1];
    main.innerHTML='<div class="page-loading"><div class="loading-ring"></div><p>Memuat halaman...</p></div>';
    try{
      const res=await fetch(pageMap[chosen][0],{cache:'no-store'});
      if(!res.ok)throw new Error('File halaman tidak ditemukan. Periksa folder pages.');
      const html=await res.text();
      await fetchAll();
      if(token!==state.token)return;
      main.innerHTML=html;
      window.scrollTo(0,0);
      if(chosen==='beranda')renderHome();
      if(chosen==='ulasan')initReviews();
      if(chosen==='tulis')initReviewForm();
      if(chosen==='lapor')initReportForm();
      if(chosen==='riwayat')initReports();
    }catch(err){if(token===state.token){main.innerHTML=errorCard(err);toast(err.message,true);}}
  }
  function renderHome(){
    el('todayLabel').textContent=currentDate();
    el('statKos').textContent=state.kos.length;
    el('statUlasan').textContent=state.ulasan.length;
    el('statLaporan').textContent=state.laporan.length;
    el('recentReviews').innerHTML=state.ulasan.length?state.ulasan.slice(0,3).map(recentRow).join(''):'<div class="empty-inline">Belum ada ulasan.</div>';
  }
  function renderReviews(){
    const f=state.filters;
    let data=state.ulasan.filter(r=>{
      const query=f.search?.toLowerCase().trim()||'';
      return (!f.kos || String(r.id_kos)===f.kos) && Number(r.rating)>=Number(f.rating||0) &&
        (kosName(r.id_kos).toLowerCase().includes(query)||String(r.isi_ulasan).toLowerCase().includes(query)||String(r.nama_penulis).toLowerCase().includes(query));
    });
    data.sort((a,b)=>f.sort==='tertinggi'?Number(b.rating)-Number(a.rating) || Number(b.id_ulasan)-Number(a.id_ulasan):f.sort==='terendah'?Number(a.rating)-Number(b.rating) || Number(b.id_ulasan)-Number(a.id_ulasan):Number(b.id_ulasan)-Number(a.id_ulasan));
    el('reviewCount').textContent=data.length;
    el('reviewList').innerHTML=data.length?data.map(reviewCard).join(''):'<div class="records-empty"><div class="empty-art">⌕</div><strong>Ulasan belum ditemukan</strong><p>Coba nama kos atau filter bintang lainnya.</p></div>';
    const summarized=f.kos?state.kos.filter(k=>String(k.id_kos)===f.kos):state.kos;
    el('kosStats').innerHTML=summarized.map(k=>{
      const rs=state.ulasan.filter(r=>Number(r.id_kos)===Number(k.id_kos));
      const avg=rs.length?(rs.reduce((sum,r)=>sum+Number(r.rating),0)/rs.length).toFixed(1):'—';
      return `<div class="kos-stat"><span>⌂ ${esc(k.nama_kos)}</span><strong>★ ${avg}</strong><small>${rs.length} ulasan</small></div>`;
    }).join('');
  }
  function initReviews(){
    selectKos('reviewKos','Semua nama kos');
    state.filters={search:'',kos:'',rating:'0',sort:'terbaru'};
    const listeners=[['reviewSearch','input','search'],['reviewKos','change','kos'],['reviewRating','change','rating'],['reviewSort','change','sort']];
    listeners.forEach(([id,event,key])=>el(id).addEventListener(event,e=>{state.filters[key]=e.target.value;renderReviews();}));
    const target=new URLSearchParams(location.search).get('kos');
    if(target && state.kos.some(k=>String(k.id_kos)===target)){
      el('reviewKos').value=target;state.filters.kos=target;
    }
    renderReviews();
  }
  function err(id,message=''){const node=el(id);if(node)node.textContent=message;}
  function validateText(input,errorId,min,max,label){
    const value=el(input).value.trim();
    const length=Array.from(value).length;
    const message=length<min?`${label} minimal ${min} karakter.`:length>max?`${label} maksimal ${max} karakter.`:'';
    err(errorId,message);
    el(input).setAttribute('aria-invalid',String(Boolean(message)));
    return !message;
  }
  function clearErrors(view){view.querySelectorAll('.field-error').forEach(e=>e.textContent='');view.querySelectorAll('[aria-invalid]').forEach(e=>e.removeAttribute('aria-invalid'));}
  function updateStars(){
    const checked=el('reviewForm').querySelector('input[name="rating"]:checked');
    const value=Number(checked?.value||0);
    el('ratingCaption').textContent=value?`${value} dari 5 bintang dipilih`:'Belum memilih bintang';
    el('starInputs').querySelectorAll('label').forEach(label=>label.classList.toggle('star-selected',Number(label.querySelector('input').value)<=value));
  }
  function initReviewForm(){
    const view=main.querySelector('.form-page');const form=el('reviewForm');
    selectKos('reviewFormKos');
    el('reviewText').addEventListener('input',e=>el('reviewChar').textContent=`${Array.from(e.target.value).length}/700 karakter`);
    view.querySelectorAll('input[name="rating"]').forEach(i=>i.addEventListener('change',updateStars));
    form.addEventListener('reset',()=>setTimeout(()=>{clearErrors(view);updateStars();el('reviewChar').textContent='0/700 karakter';},0));
    form.addEventListener('submit',async e=>{
      e.preventDefault();clearErrors(view);
      const id=Number(el('reviewFormKos').value);
      const rating=Number(view.querySelector('input[name="rating"]:checked')?.value||0);
      let valid=true;
      if(!state.kos.some(k=>Number(k.id_kos)===id)){err('reviewKosError','Pilih nama kos.');valid=false;}
      if(rating<1||rating>5){err('ratingError','Pilih bintang 1 sampai 5.');valid=false;}
      if(!validateText('reviewName','reviewNameError',2,50,'Nama tampilan'))valid=false;
      if(!validateText('reviewText','reviewTextError',20,700,'Ulasan'))valid=false;
      if(!valid)return;
      const btn=el('submitReview');btn.disabled=true;btn.textContent='Menyimpan ulasan...';
      try{
        await request('ulasan',{id_kos:id,rating,nama_penulis:el('reviewName').value.trim(),isi_ulasan:el('reviewText').value.trim()});
        toast('Ulasan berhasil ditambahkan dan akan terlihat di Ulasan Kos.');
        location.hash='#ulasan';
      }catch(error){toast(error.message,true);}finally{if(btn.isConnected){btn.disabled=false;btn.textContent='Kirim Ulasan ↗';}}
    });
  }
  function initReportForm(){
    const view=main.querySelector('.form-page');const form=el('reportForm');
    selectKos('reportKos');
    el('reportText').addEventListener('input',e=>el('reportChar').textContent=`${Array.from(e.target.value).length}/1500 karakter`);
    form.addEventListener('reset',()=>setTimeout(()=>{clearErrors(view);el('reportChar').textContent='0/1500 karakter';},0));
    form.addEventListener('submit',async e=>{
      e.preventDefault();clearErrors(view);
      const id=Number(el('reportKos').value);const kategori=el('reportType').value;
      let valid=true;
      if(!state.kos.some(k=>Number(k.id_kos)===id)){err('reportKosError','Pilih nama kos.');valid=false;}
      if(!['dugaan_penipuan','ketidaksesuaian','keamanan','pelayanan','lainnya'].includes(kategori)){err('reportTypeError','Pilih kategori laporan.');valid=false;}
      if(!validateText('reportTitle','reportTitleError',8,100,'Judul'))valid=false;
      if(!validateText('reportText','reportTextError',30,1500,'Kronologi'))valid=false;
      if(!valid)return;
      const btn=el('submitReport');btn.disabled=true;btn.textContent='Menyimpan laporan...';
      try{
        await request('laporan',{id_kos:id,kategori,judul:el('reportTitle').value.trim(),kronologi:el('reportText').value.trim()});
        toast('Laporan tersimpan sebagai dugaan yang belum diverifikasi.');
        location.hash='#riwayat';
      }catch(error){toast(error.message,true);}finally{if(btn.isConnected){btn.disabled=false;btn.textContent='Kirim Laporan ↗';}}
    });
  }
  function renderReports(){
    const search=el('searchReports').value.toLowerCase().trim();
    const kind=el('reportCategory').value;
    const sort=el('sortSelect').value;
    const list=state.laporan.filter(r=>(!kind||r.kategori===kind)&& (kosName(r.id_kos).toLowerCase().includes(search)||String(r.judul).toLowerCase().includes(search)||String(r.kronologi).toLowerCase().includes(search)));
    list.sort((a,b)=>sort==='terlama'?Number(a.id_laporan)-Number(b.id_laporan):Number(b.id_laporan)-Number(a.id_laporan));
    el('reportCount').textContent=list.length;
    el('reportList').innerHTML=list.length?list.map(reportCard).join(''):'<div class="records-empty"><div class="empty-art">⌕</div><strong>Belum ada laporan yang cocok</strong><p>Ubah filter atau buat laporan baru.</p></div>';
  }
  function initReports(){
    [['searchReports','input'],['reportCategory','change'],['sortSelect','change']].forEach(([id,ev])=>el(id).addEventListener(ev,renderReports));
    renderReports();
  }
  function openReport(id){
    const r=state.laporan.find(x=>Number(x.id_laporan)===id);if(!r)return;
    el('dialogContents').innerHTML=`<h2>${esc(r.judul)}</h2><div class="dialog-row"><span>Nomor laporan</span><strong>#LPR-${String(r.id_laporan).padStart(3,'0')}</strong></div><div class="dialog-row"><span>Nama kos</span><strong>${esc(kosName(r.id_kos))}</strong></div><div class="dialog-row"><span>Kategori</span><strong>${esc(category(r.kategori))}</strong></div><div class="dialog-row"><span>Tanggal</span><strong>${esc(dateString(r.tanggal))}</strong></div><div class="dialog-row"><span>Status</span><strong>Menunggu Verifikasi</strong></div><p class="dialog-label">KRONOLOGI (DATA DEMO)</p><div class="dialog-report">${esc(r.kronologi)}</div><div class="modal-warning">Laporan ini berupa dugaan dan tidak membuktikan pelanggaran.</div>`;
    if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','');
  }
  window.addEventListener('hashchange',()=>void loadPage());
  void loadPage();
})();
