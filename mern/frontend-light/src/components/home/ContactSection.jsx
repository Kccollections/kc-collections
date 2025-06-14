import React from 'react';

const ContactSection = () => {
  return (
    <section id="contact" className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#c0753b]">Contact Us</h2>
          <p className="text-gray-600 text-lg mb-8">We are always available to guide you at your convenience.</p>
          
          {/* Decorative line with circular elements */}
          <div className="flex items-center justify-center w-full max-w-4xl mx-auto">
            <img
              src="../images/Section line.png" 
              alt="Section line" 
              className="section-line h-12 mt-2"
            />
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
            <div className="p-8">
              <div className="flex items-center justify-center mb-6">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/1200px-WhatsApp.svg.png" 
                  alt="WhatsApp Icon" 
                  className="w-16 h-16"
                />
              </div>
              <h3 className="text-xl font-semibold text-center mb-4">Connect on WhatsApp</h3>
              <p className="text-gray-600 text-center mb-8">
                Reach out to us on WhatsApp for quick assistance and support. Click the button below to start chatting with us instantly!
              </p>
              <div className="text-center">
                <a 
                  href="https://wa.me/7087993619" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block px-10 py-3 bg-[#e05e52] text-white rounded-md font-medium hover:bg-[#c14e43] transition-colors duration-300"
                >
                  Connect Now
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;