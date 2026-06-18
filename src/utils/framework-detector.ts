interface FrameworkDefaults {
  framework: string;
  type: string;
  buildCommand?: string;
  startCommand?: string;
}

export function detectFramework(repoName: string, language?: string): FrameworkDefaults {
  const name = repoName.toLowerCase();

  if (name.includes('next')) {
    return { framework: 'nextjs', type: 'api', buildCommand: 'npm run build', startCommand: 'npm start' };
  }
  if (name.includes('react') || name.includes('vite')) {
    return { framework: 'react', type: 'static_site', buildCommand: 'npm run build' };
  }
  if (name.includes('vue') || name.includes('nuxt')) {
    return { framework: 'node', type: 'api', buildCommand: 'npm run build', startCommand: 'npm start' };
  }

  const lang = (language || '').toLowerCase();

  if (lang === 'python' && name.includes('django')) {
    return { framework: 'django', type: 'api', buildCommand: 'pip install -r requirements.txt', startCommand: 'python manage.py runserver 0.0.0.0:8000' };
  }
  if (lang === 'python' && name.includes('flask')) {
    return { framework: 'python', type: 'api', buildCommand: 'pip install -r requirements.txt', startCommand: 'python app.py' };
  }
  if (lang === 'python') {
    return { framework: 'python', type: 'api', buildCommand: 'pip install -r requirements.txt', startCommand: 'python main.py' };
  }
  if (lang === 'go') {
    return { framework: 'go', type: 'api', buildCommand: 'go build -o app', startCommand: './app' };
  }
  if (lang === 'javascript' || lang === 'typescript') {
    return { framework: 'node', type: 'api', buildCommand: 'npm install', startCommand: 'npm start' };
  }

  return { framework: 'static', type: 'static_site' };
}
