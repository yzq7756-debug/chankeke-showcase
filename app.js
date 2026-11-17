"use strict";
(async () => {
  let shop = window.SHOP_CONTENT;
  if (!shop) throw Error("菜单数据未加载，请刷新页面。");
  if (shop.settings) {
    const settings = shop.settings;
    const title = document.querySelector('#hero-title');
    title.replaceChildren();
    settings.headline.split('/').forEach((line,i)=>{if(i)title.append(document.createElement('br'));title.append(document.createTextNode(line));});
    document.querySelector('.hero-description').textContent = settings.description;
    document.querySelector('.eyebrow').textContent = settings.eyebrow;
    document.querySelector('.hero-image').src = settings.hero;
    document.querySelector('.brand-logo').src = settings.logo;
    document.querySelector('link[rel="icon"]').href = settings.logo;
    document.querySelector('.site-footer>span').textContent = settings.footer;
    const heroImage = document.querySelector('.hero-image');
    const rotation = Number(settings.rotation);
    heroImage.style.transform = `translate(-50%,-50%) rotate(${rotation}deg)`;
    heroImage.style.width = Math.abs(rotation)%180 ? '100cqh':'100cqw';
    heroImage.style.height = Math.abs(rotation)%180 ? '100cqw':'100cqh';
    const qr = document.querySelector('.qr-crop');
    qr.href = settings.qr;
    qr.querySelector('img').src = settings.qr;
    if(!settings.qrCrop)qr.classList.add('qr-full');
    const group = document.querySelector('.filters');group.replaceChildren();
    for(const category of ['全部',...shop.categories]) {
      const button=document.createElement('button');button.type='button';button.dataset.category=category;
      button.append(document.createTextNode(category==='全部'?'全部美味':category),document.createElement('span'));group.append(button);
    }
  }
  const grid = document.querySelector("#food-grid");
  const filters = [...document.querySelectorAll("[data-category]")];
  const status = document.querySelector("#filter-status");
  const categoryClass = { "手工麻辣": "creative", "鲜卤鸭货系列": "braised" };
  const make = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  };
  document.querySelectorAll("[data-shop-name]").forEach(el => { el.textContent = shop.name; });
  document.title = `${shop.name} · 私厨用心做，鲜卤好滋味`;
  document.querySelector(".brand").setAttribute("aria-label", `${shop.name}，返回顶部`);

  const render = (category, announce = true) => {
    const dishes = shop.dishes.filter(dish => category === "全部" || dish.category === category);
    grid.replaceChildren();
    dishes.forEach(dish => {
      const card = make("article", `food-card ${categoryClass[dish.category] || ""}`);
      const images = dish.images || (dish.image ? [dish.image] : []);
      if (images.length) {
        let index = 0;
        const gallery = make("div", "dish-gallery");
        const img = make("img", "gallery-image");
        img.loading = "lazy";
        img.decoding = "async";
        const counter = make("span", "gallery-count");
        counter.setAttribute("aria-live", "polite");
        const update = () => {
          const size = dish.imageSizes?.[images[index]];
          if (size) { img.width = size[0]; img.height = size[1]; }
          img.src = images[index];
          img.alt = `${dish.name}，第 ${index + 1} 张，共 ${images.length} 张`;
          counter.textContent = `${index + 1} / ${images.length}`;
        };
        gallery.append(img);
        if (images.length > 1) {
          const controls = make("div", "gallery-controls");
          const prev = make("button", "gallery-button", "‹");
          const next = make("button", "gallery-button", "›");
          prev.type = next.type = "button";
          prev.setAttribute("aria-label", `${dish.name}：上一张图片`);
          next.setAttribute("aria-label", `${dish.name}：下一张图片`);
          prev.addEventListener("click", () => { index = (index + images.length - 1) % images.length; update(); });
          next.addEventListener("click", () => { index = (index + 1) % images.length; update(); });
          controls.append(prev, counter, next);
          gallery.append(controls);
        }
        update();
        card.append(gallery);
      }
      const body = make("div", "food-body");
      body.append(make("span", "category-pill", dish.category));
      const titleRow = make("div", "card-title-row");
      titleRow.append(make("h3", "", dish.name), make("span", "dish-price", `¥${dish.price}`));
      body.append(titleRow);
      if (dish.spec) body.append(make("p", "dish-spec", dish.spec));
      card.append(body);
      grid.append(card);
    });
    if (!dishes.length) grid.append(make("p", "empty-note", "这一类的美味还在准备中。"));
    filters.forEach(button => { button.setAttribute("aria-pressed", String(button.dataset.category === category)); });
    if (announce) status.textContent = `正在展示${category === "全部" ? "全部美味" : category}，共 ${dishes.length} 款菜品。`;
  };
  filters.forEach(button => {
    const count = shop.dishes.filter(dish => button.dataset.category === "全部" || dish.category === button.dataset.category).length;
    button.querySelector("span").textContent = String(count).padStart(2, "0");
    button.addEventListener("click", () => render(button.dataset.category));
  });
  document.querySelector(".sample-note").textContent = "价格与规格按店铺菜单展示 · 人民币";
  render("全部", false);

  const details = document.querySelector(".contact-details");
  details.replaceChildren();
  shop.contact.phones.forEach(phone => {
    const row = make("div", "contact-row");
    const icon = make("span", "contact-icon", "☎");
    icon.setAttribute("aria-hidden", "true");
    const info = make("div", "");
    const number = make("a", "phone-number", phone.number);
    number.href = `tel:${phone.number}`;
    info.append(make("h3", "", phone.label), number);
    const call = make("a", "contact-action", "拨打 ↗");
    call.href = number.href;
    call.setAttribute("aria-label", `拨打${phone.label}：${phone.number}`);
    row.append(icon, info, call);
    details.append(row);
  });
})().catch(error => {
  const message = document.createElement('p');message.textContent = error.message;
  message.setAttribute('role','alert');document.querySelector('#food-grid').replaceChildren(message);
});
