# Publicar o Poker Dashboard na web (Netlify)

Siga estes passos para colocar o dashboard online. O site vai buscar os dados da sua planilha via Apps Script.

---

## 1. Deixar o projeto no GitHub (recomendado)

Para o Netlify atualizar o site sempre que você mudar o código:

1. Crie uma conta em **https://github.com** (se ainda não tiver).
2. Crie um **novo repositório** (New repository). Nome sugerido: `poker-home-game-dashboard`. Não marque “Add a README” se a pasta já tiver arquivos.
3. Na pasta do projeto no seu PC, abra o PowerShell e execute (troque `SEU_USUARIO` e `poker-home-game-dashboard` pelo seu usuário e nome do repositório):

```powershell
cd "C:\Users\VITABE0252\OneDrive - VITABE\Área de Trabalho\poker-home-game-dashboard"
git init
git add .
git commit -m "Projeto Poker Dashboard"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/poker-home-game-dashboard.git
git push -u origin main
```

Se preferir **não** usar Git, você pode fazer deploy **arrastando a pasta** no Netlify (veja passo 3, opção B). O site sobe, mas não atualiza sozinho quando você mudar o código.

---

## 2. Configurar a variável de ambiente no Netlify

A URL do Apps Script **não** pode ficar no código no GitHub. Ela fica nas variáveis de ambiente do Netlify.

1. Acesse **https://app.netlify.com** e faça login.
2. **Antes** de criar o site (ou depois): vá em **Team overview** > **Site configuration** (ou no seu site) > **Environment variables** (ou **Site settings** > **Environment variables**).
3. Clique em **Add a variable** ou **Add environment variable**.
4. Preencha:
   - **Key:** `APPS_SCRIPT_URL`
   - **Value:** a URL do seu App da Web do Google (a que está no seu `.env`). Exemplo:  
     `https://script.google.com/macros/s/AKfycbzqXTabDvrSDJ6uMybXA0Hjdazsz0zUPTu4Q3SiN5o2jjv3-VC_2ji71INQLINz3Zk/exec`
5. Escopo: **All scopes** (ou pelo menos “Build” e “Production”).
6. Salve.

Assim o dashboard na web usa a mesma URL que você usa no `.env` localmente.

---

## 3. Criar o site no Netlify

### Opção A — Conectar com o GitHub (recomendado)

1. No Netlify: **Add new site** > **Import an existing project**.
2. Escolha **GitHub** e autorize o Netlify, se pedir.
3. Selecione o repositório **poker-home-game-dashboard** (ou o nome que você deu).
4. Em **Build settings**:
   - **Build command:** `npm run build` (já deve vir preenchido).
   - **Publish directory:** pode deixar em branco; o plugin Next.js cuida disso.
   - **Base directory:** em branco.
5. Antes de dar **Deploy**, confira em **Environment variables** se a variável **APPS_SCRIPT_URL** está cadastrada (passo 2).
6. Clique em **Deploy site**.

O Netlify vai rodar `npm run build` e publicar o Next.js. Quando terminar, ele mostra a URL do site (ex.: `https://nome-aleatorio.netlify.app`).

### Opção B — Deploy arrastando a pasta (sem Git)

1. No Netlify: **Add new site** > **Deploy manually** (ou “Drag and drop”).
2. Antes, na pasta do projeto, rode o build no seu PC:
   ```powershell
   cd "C:\Users\VITABE0252\OneDrive - VITABE\Área de Trabalho\poker-home-game-dashboard"
   npm run build
   ```
3. **Importante:** o Netlify precisa do resultado do build. Para deploy manual com Next.js, costuma-se usar a pasta `.next` e o plugin; na prática, o mais simples é **conectar um repositório Git** (opção A). Se você só arrastar a pasta sem build, o site pode não funcionar. Por isso a **recomendação é usar a opção A (GitHub)**.

Se mesmo assim quiser tentar sem Git: depois do primeiro deploy por Git, você pode em **Site settings** > **Build & deploy** configurar **Build command** e **Publish directory**; para Next.js o Netlify costuma detectar e usar o plugin.

---

## 4. Conferir se está tudo certo

1. Abra a URL do site (ex.: `https://seu-site.netlify.app`).
2. O dashboard deve carregar. Se aparecer “Erro ao carregar sessões” ou “APPS_SCRIPT_URL não está definido”:
   - Confira em **Site settings** > **Environment variables** se **APPS_SCRIPT_URL** está definida e com a URL correta (igual à do `.env`).
   - Faça um **Trigger deploy** (Deploy manually ou “Clear cache and deploy site”) para aplicar a variável.

---

## 5. Resumo

| O quê | Onde |
|-------|------|
| Código no GitHub | Repositório `poker-home-game-dashboard` (ou outro nome). |
| URL do Apps Script | Netlify > Site settings > Environment variables > **APPS_SCRIPT_URL** |
| Deploy | Netlify > Add new site > Import from Git > escolher o repositório. |
| Link do dashboard | Ex.: `https://seu-site.netlify.app` |

O projeto já está preparado com **netlify.toml** e uso do plugin Next.js. Depois de configurar a variável **APPS_SCRIPT_URL** e conectar o repositório, o site fica no ar e pode ser atualizado a cada push no GitHub.

---

## Se o build falhar no Netlify

- Instale o plugin do Next.js na pasta do projeto e faça commit de novo:
  ```powershell
  npm install -D @netlify/plugin-nextjs
  ```
  Depois: `git add package.json package-lock.json` e `git commit -m "Add Netlify Next.js plugin"` e `git push`.
- Confira se a variável **APPS_SCRIPT_URL** está definida em **Site settings** > **Environment variables**.
- Em **Build settings**, o comando deve ser **Build command:** `npm run build` (e **Publish directory** pode ficar em branco).
