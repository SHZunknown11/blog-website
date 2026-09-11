document.addEventListener('DOMContentLoaded', () => {
  const ta = document.getElementById('postBody');
  const chars = document.getElementById('chars');


  // autosize helper
  function autosize(el){
    el.style.height = 'auto';
    el.style.height = (el.scrollHeight) + 'px';
  }

  // char count
  function updateCount(){
    const len = ta.value.length;
    chars.textContent = len;
    if(len > 500) {
      chars.style.color = 'crimson';
    } else {
      chars.style.color = '';
    }
  }

  if(ta){
    autosize(ta);
    ta.addEventListener('input', () => {
      autosize(ta);
      updateCount();
    });
  }


});
