import React from 'react';

const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    initials: "SJ",
    text: "The quality of KC Collection's pieces is exceptional. I've received so many compliments on my necklace!",
    rating: 5
  },
  {
    id: 2,
    name: "Mark Lee",
    initials: "ML",
    text: "Beautiful design and excellent customer service. Will definitely be ordering again.",
    rating: 5
  },
  {
    id: 3,
    name: "David Thompson",
    initials: "DT",
    text: "I bought earrings for my wife's birthday and she absolutely loves them. Thank you KC Collection!",
    rating: 5
  }
];

const TestimonialsSection = () => {
  return (
    <section className="bg-white py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-2">What Our Customers Say</h2>
          <p className="text-gray-600">Discover why our customers love KC Collection</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <svg 
                    key={i} 
                    className="w-5 h-5 text-yellow-400" 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <blockquote className="mb-4 italic text-gray-700">
                {testimonial.text}
              </blockquote>
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold">
                  {testimonial.initials}
                </div>
                <div className="ml-3">
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">Verified Customer</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;