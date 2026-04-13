import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="bg-gray-800 text-white mt-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <!-- About -->
          <div>
            <h3 class="text-lg font-bold mb-4">SERVMECA</h3>
            <p class="text-gray-400">
              Sistema de Auxilio y Reparación Automotriz para conectar usuarios con talleres mecánicos certificados.
            </p>
          </div>

          <!-- Links -->
          <div>
            <h4 class="font-bold mb-4">Enlaces</h4>
            <ul class="space-y-2 text-gray-400">
              <li><a href="#" class="hover:text-white">Inicio</a></li>
              <li><a href="#" class="hover:text-white">Servicios</a></li>
              <li><a href="#" class="hover:text-white">Talleres</a></li>
              <li><a href="#" class="hover:text-white">Contacto</a></li>
            </ul>
          </div>

          <!-- Legal -->
          <div>
            <h4 class="font-bold mb-4">Legal</h4>
            <ul class="space-y-2 text-gray-400">
              <li><a href="#" class="hover:text-white">Términos de Servicio</a></li>
              <li><a href="#" class="hover:text-white">Privacidad</a></li>
              <li><a href="#" class="hover:text-white">Cookies</a></li>
              <li><a href="#" class="hover:text-white">Disclaimer</a></li>
            </ul>
          </div>

          <!-- Contact -->
          <div>
            <h4 class="font-bold mb-4">Contacto</h4>
            <p class="text-gray-400 mb-2">Email: info@servmeca.com</p>
            <p class="text-gray-400 mb-4">Phone: +34 900 123 456</p>
            <div class="flex space-x-4">
              <a href="#" class="text-gray-400 hover:text-white">
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" class="text-gray-400 hover:text-white">
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2s9 5 20 5a9.5 9.5 0 00-9-5.5c4.75 2.25 7-7 7-7"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div class="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2026 SERVMECA. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {}
