/* Navegação Áreas → membros por departamento */
(function () {
  'use strict';

  const registry = window.FIC_MEMBERS;
  const AREA_MEMBERS = registry ? registry.byArea : {};
  const AREA_LABELS = registry ? registry.AREA_LABELS : {
    tecnologia: 'Tecnologia',
    comercial: 'Comercial',
    marketing: 'Marketing',
    financeiro: 'Financeiro',
    infraestrutura: 'Infraestrutura',
    juridico: 'Jurídico',
  };

  const wrap = document.getElementById('areasWrap');
  const menuAreas = document.getElementById('areasMenu');
  const menuPeople = document.getElementById('areasPeopleMenu');
  const peopleHd = document.getElementById('areasPeopleHd');
  if (!wrap || !menuAreas || !menuPeople) return;

  function clearMembers() {
    menuPeople.querySelectorAll('.hdr-area-member,.hdr-areas-empty').forEach((el) => el.remove());
  }

  function showAreasList() {
    menuAreas.hidden = false;
    menuPeople.hidden = true;
    clearMembers();
  }

  function showAreaMembers(areaKey) {
    const members = AREA_MEMBERS[areaKey] || [];
    const label = AREA_LABELS[areaKey] || areaKey;
    menuAreas.hidden = true;
    menuPeople.hidden = false;
    clearMembers();
    if (peopleHd) peopleHd.textContent = label;

    if (!members.length) {
      const li = document.createElement('li');
      li.className = 'hdr-areas-empty';
      li.setAttribute('role', 'listitem');
      li.textContent = 'Nenhum membro cadastrado nesta área.';
      menuPeople.appendChild(li);
      return;
    }

    members.forEach((m) => {
      const li = document.createElement('li');
      li.className = 'hdr-area-member';
      li.setAttribute('role', 'listitem');
      if (m.href) {
        li.innerHTML = `<a href="${m.href}">${m.name}</a>`;
      } else {
        li.innerHTML = `<span class="hdr-area-name">${m.name}</span>`;
      }
      menuPeople.appendChild(li);
    });
  }

  menuAreas.querySelectorAll('.hdr-area-trigger').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      showAreaMembers(btn.dataset.area);
    });
  });

  menuPeople.querySelector('.hdr-areas-back')?.addEventListener('click', (e) => {
    e.stopPropagation();
    showAreasList();
  });

  wrap.addEventListener('hdr-dropdown-close', showAreasList);
  window.resetAreasMenu = showAreasList;
})();
