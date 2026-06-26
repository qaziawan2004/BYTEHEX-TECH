import React from 'react';
import { 
  Heart, 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube,
  Github,
  Award,
  Shield,
  Truck,
  CreditCard,
  Sparkles,
  ChevronRight
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'About Us', href: '#' },
    { name: 'Contact', href: '#' },
    { name: 'FAQs', href: '#' },
    { name: 'Shipping Info', href: '#' },
    { name: 'Returns', href: '#' },
    { name: 'Privacy Policy', href: '#' },
  ];

  const categories = [
    { name: 'Electronics', href: '#' },
    { name: 'Fashion', href: '#' },
    { name: 'Home & Living', href: '#' },
    { name: 'Accessories', href: '#' },
    { name: 'Gadgets', href: '#' },
    { name: 'New Arrivals', href: '#' },
  ];

  const socialLinks = [
    { icon: Facebook, href: '#', color: 'hover:text-blue-400' },
    { icon: Twitter, href: '#', color: 'hover:text-sky-400' },
    { icon: Instagram, href: '#', color: 'hover:text-pink-400' },
    { icon: Youtube, href: '#', color: 'hover:text-red-400' },
    { icon: Github, href: '#', color: 'hover:text-gray-400' },
  ];

  const features = [
    { icon: Truck, text: 'Free Shipping', subtext: 'On orders over $50' },
    { icon: Shield, text: 'Secure Payment', subtext: '100% secure checkout' },
    { icon: Award, text: 'Quality Guarantee', subtext: 'Premium products only' },
    { icon: Heart, text: '24/7 Support', subtext: 'Dedicated customer care' },
  ];

  return (
    <footer className="bg-black border-t border-gray-800/50 mt-12">
      {/* Features Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index} 
                className="flex items-center gap-3 p-3 rounded-xl bg-gray-900/30 border border-gray-800/50 transition-all duration-300 hover:bg-gray-800/30 hover:border-emerald-500/30"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{feature.text}</p>
                  <p className="text-xs text-gray-500">{feature.subtext}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Footer */}
      <div className="border-t border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Brand Column */}
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">P</span>
                </div>
                <span className="text-xl font-bold">
                  <span className="text-white">Premium</span>
                  <span className="text-emerald-400">Vella</span>
                </span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                Your one-stop destination for premium products.
              </p>
              
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5 text-sm text-gray-400">
                  <div className="w-7 h-7 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <Mail className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <span>support@premiumvella.com</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-gray-400">
                  <div className="w-7 h-7 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-gray-400">
                  <div className="w-7 h-7 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <span>123 Commerce St, NY 10001</span>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                {socialLinks.map((social, index) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={index}
                      href={social.href}
                      className={`w-9 h-9 rounded-full bg-gray-900/50 flex items-center justify-center text-gray-500 transition-all duration-300 hover:bg-emerald-500/20 hover:scale-110 ${social.color}`}
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Quick Links</h3>
              <ul className="space-y-2.5">
                {quickLinks.map((link, index) => (
                  <li key={index}>
                    <a href={link.href} className="text-sm text-gray-500 hover:text-emerald-400 transition-colors duration-200 flex items-center gap-2 group">
                      <ChevronRight className="w-3 h-3 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Shop Categories</h3>
              <ul className="space-y-2.5">
                {categories.map((category, index) => (
                  <li key={index}>
                    <a href={category.href} className="text-sm text-gray-500 hover:text-emerald-400 transition-colors duration-200 flex items-center gap-2 group">
                      <ChevronRight className="w-3 h-3 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      {category.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Newsletter</h3>
              <p className="text-sm text-gray-500 mb-4">Subscribe to get special offers and exclusive deals.</p>
              <form className="flex flex-col gap-3">
                <div className="flex items-center bg-gray-900/50 rounded-xl border border-gray-800/50 focus-within:border-emerald-500/50 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all duration-200 overflow-hidden">
                  <input
                    type="email"
                    placeholder="Your email"
                    className="flex-1 px-4 py-2.5 bg-transparent text-white text-sm outline-none placeholder:text-gray-600"
                  />
                  <button type="submit" className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-colors duration-200 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Subscribe
                  </button>
                </div>
                <p className="text-xs text-gray-600">By subscribing, you agree to our Privacy Policy.</p>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800/50 bg-black/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col items-center justify-center gap-2">
            <p className="text-xs text-gray-600 text-center">© {currentYear} PremiumVella. All rights reserved.</p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600">Built with</span>
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse" />
              <span className="text-xs text-gray-600">by</span>
              <span className="text-xs font-semibold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">@PremiumVella</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;