const button = document.getElementById('myButton');

console.log('Script start');

button.addEventListener('click', () => {
    console.log('Button clicked!');

    setTimeout(() => {
        console.log('setTimeout in click handler');
    }, 0);

    Promise.resolve().then(() => {
        console.log('Promise in click handler');
    });

});

console.log('Script end');
