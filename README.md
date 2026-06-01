# Relatório Carlos — Dashboard Executivo

Dashboard de performance anual de **Carlos Eber Santos** (Tecnologia Sênior · Infraestrutura & BPO).

Site estático (HTML, CSS e JavaScript). Pronto para [GitHub](https://github.com/abarakus11/Relatorio-Carlos-) e [Vercel](https://vercel.com).

## Estrutura

```
relatorio-carlos/
├── index.html          # Página principal
├── assets/
│   └── carlos-eber-perfil.png
├── vercel.json         # Cache de assets na Vercel
├── .gitignore
└── README.md
```

## Publicar no GitHub

Na pasta do projeto:

```bash
cd relatorio-carlos
git init
git add .
git commit -m "Dashboard executivo — relatório de performance"
git branch -M main
git remote add origin https://github.com/abarakus11/Relatorio-Carlos-.git
git push -u origin main
```

## Deploy na Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login com o GitHub.
2. **Add New Project** → importe o repositório `Relatorio-Carlos-`.
3. Framework Preset: **Other** (site estático).
4. Root Directory: `.` (raiz do repositório).
5. Build Command: deixe em branco. Output Directory: `.` ou deixe o padrão.
6. Deploy.

A URL ficará no formato `https://relatorio-carlos.vercel.app` (ou o nome que escolher).

## Desenvolvimento local

Abra `index.html` no navegador ou use um servidor simples:

```bash
npx serve .
```

## Recursos externos

Estes arquivos são carregados por URL (requer internet):

- GIF de fundo da página (Pinterest)
- GIF do cabeçalho (Tenor)
- GIF do KPI “Chamados Resolvidos” (Gifer)
- Google Fonts e Chart.js (CDN)

## Licença

Uso interno / confidencial — documento de performance profissional.
