document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', () => {
        const answer = question.nextElementSibling;
        const isVisible = answer.style.display === 'block';
        
        // Toggle the display of the clicked answer
        answer.style.display = isVisible ? 'none' : 'block';
    });
});
