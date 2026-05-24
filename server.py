"""
server.py — Servidor local de desenvolvimento
=============================================
Rode com:  python server.py
Acesse em: http://localhost:8080

Este script usa apenas a biblioteca padrão do Python —
não precisa instalar nada extra.

O que ele faz:
- Serve os arquivos estáticos do projeto (HTML, CSS, JS)
- Suporta Range requests (necessário para áudio/vídeo no Chrome)
- Adiciona cabeçalhos CORS pra evitar erros no browser
- Exibe um log colorido de cada requisição no terminal
- Abre o browser automaticamente ao iniciar
"""

import http.server
import socketserver
import webbrowser
import os
import sys
import urllib.parse
from datetime import datetime

# ── Configurações ─────────────────────────────────
HOST = 'localhost'
PORT = 8080

# Cores ANSI para o terminal
PINK   = '\033[95m'
BLUE   = '\033[94m'
GREEN  = '\033[92m'
YELLOW = '\033[93m'
RED    = '\033[91m'
RESET  = '\033[0m'
BOLD   = '\033[1m'


# ── Handler personalizado ─────────────────────────
class ShawtyHandler(http.server.SimpleHTTPRequestHandler):
    """
    Estende o SimpleHTTPRequestHandler para:
    1. Suportar Range requests (206 Partial Content) — necessário para MP4/MP3
    2. Adicionar cabeçalhos CORS
    3. Logar requisições com cor e hora
    """

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Accept-Ranges', 'bytes')
        super().end_headers()

    def do_GET(self):
        if self.path == '/':
            self.path = '/index.html'

        # Decodifica URL e remove query string para localizar o arquivo
        clean_path = urllib.parse.unquote(self.path.split('?')[0]).lstrip('/')
        file_path  = os.path.join(os.getcwd(), clean_path)
        range_hdr  = self.headers.get('Range')

        if range_hdr and os.path.isfile(file_path):
            self._serve_partial(file_path, range_hdr)
        else:
            super().do_GET()

    def _serve_partial(self, file_path, range_hdr):
        """Responde com 206 Partial Content para Range requests (áudio e vídeo)."""
        try:
            file_size  = os.path.getsize(file_path)
            byte_range = range_hdr.replace('bytes=', '')
            start_str, _, end_str = byte_range.partition('-')
            start  = int(start_str)       if start_str.strip() else 0
            end    = int(end_str.strip()) if end_str.strip()   else file_size - 1
            end    = min(end, file_size - 1)
            length = end - start + 1

            self.send_response(206)
            self.send_header('Content-Type',   self.guess_type(file_path))
            self.send_header('Content-Range',  f'bytes {start}-{end}/{file_size}')
            self.send_header('Content-Length', str(length))
            self.end_headers()

            with open(file_path, 'rb') as f:
                f.seek(start)
                self.wfile.write(f.read(length))

        except Exception:
            super().do_GET()

    def log_message(self, format, *args):
        hora   = datetime.now().strftime('%H:%M:%S')
        status = args[1] if len(args) > 1 else '???'
        if   status.startswith('2'): cor = GREEN
        elif status.startswith('3'): cor = YELLOW
        elif status.startswith('4'): cor = RED
        else:                        cor = BLUE

        caminho = args[0].split('"')[1] if '"' in args[0] else args[0]
        print(f"{PINK}[{hora}]{RESET} {cor}{status}{RESET}  {caminho}")


# ── Ponto de entrada ──────────────────────────────
def main():
    pasta = os.path.dirname(os.path.abspath(__file__))
    os.chdir(pasta)

    print(f"\n{BOLD}{PINK}💕  Shawty — Servidor local{RESET}")
    print(f"{'─' * 40}")
    print(f"  Endereço : {BLUE}http://{HOST}:{PORT}{RESET}")
    print(f"  Pasta    : {YELLOW}{pasta}{RESET}")
    print(f"  Para parar: {RED}Ctrl + C{RESET}")
    print(f"{'─' * 40}\n")

    with socketserver.TCPServer((HOST, PORT), ShawtyHandler) as httpd:
        httpd.allow_reuse_address = True

        import threading
        timer = threading.Timer(
            0.5,
            lambda: webbrowser.open(f'http://{HOST}:{PORT}')
        )
        timer.start()

        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print(f"\n{PINK}💕  Servidor encerrado. Até logo!{RESET}\n")
            timer.cancel()
            sys.exit(0)


if __name__ == '__main__':
    main()
