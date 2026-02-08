-- ============================================
-- ESQUEMA SQL PARA PORTAFOLIO VS CODE
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLA: profile_info
-- Información del perfil/usuario del portafolio
-- ============================================
CREATE TABLE IF NOT EXISTS profile_info (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    title VARCHAR(150),
    bio TEXT,
    email VARCHAR(255),
    location VARCHAR(100),
    avatar_url TEXT,
    resume_url TEXT,
    social_links JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar registro inicial de perfil
INSERT INTO profile_info (name, title, bio, email, social_links) VALUES (
    'Tu Nombre',
    'Full Stack Developer',
    'Desarrollador apasionado por crear experiencias digitales increíbles.',
    'tu@email.com',
    '{"github": "https://github.com/tuusuario", "linkedin": "https://linkedin.com/in/tuusuario", "twitter": "https://twitter.com/tuusuario"}'
);

-- ============================================
-- TABLA: skills
-- Habilidades técnicas organizadas por categoría
-- ============================================
CREATE TABLE IF NOT EXISTS skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    label VARCHAR(100) NOT NULL,
    icon VARCHAR(100),
    category VARCHAR(50) NOT NULL,
    proficiency INTEGER DEFAULT 80 CHECK (proficiency >= 0 AND proficiency <= 100),
    years_experience DECIMAL(3,1),
    is_featured BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar skills de ejemplo
INSERT INTO skills (label, icon, category, proficiency, is_featured, sort_order) VALUES
    ('TypeScript', 'typescript', 'languages', 90, true, 1),
    ('JavaScript', 'javascript', 'languages', 95, true, 2),
    ('Python', 'python', 'languages', 75, false, 3),
    ('HTML5', 'html5', 'languages', 95, false, 4),
    ('CSS3', 'css3', 'languages', 90, false, 5),
    ('Angular', 'angular', 'frameworks', 90, true, 1),
    ('React', 'react', 'frameworks', 80, true, 2),
    ('Node.js', 'nodejs', 'frameworks', 85, true, 3),
    ('NestJS', 'nestjs', 'frameworks', 75, false, 4),
    ('PostgreSQL', 'postgresql', 'databases', 85, true, 1),
    ('MongoDB', 'mongodb', 'databases', 80, false, 2),
    ('Supabase', 'supabase', 'databases', 85, true, 3),
    ('Git', 'git', 'tools', 90, true, 1),
    ('Docker', 'docker', 'tools', 75, false, 2),
    ('VS Code', 'vscode', 'tools', 95, false, 3),
    ('AWS', 'aws', 'tools', 70, false, 4);

-- ============================================
-- TABLA: projects
-- Proyectos del portafolio
-- ============================================
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE,
    description TEXT,
    long_description TEXT,
    tech_stack TEXT[] DEFAULT '{}',
    image_url TEXT,
    gallery_urls TEXT[] DEFAULT '{}',
    live_link TEXT,
    repo_link TEXT,
    is_featured BOOLEAN DEFAULT false,
    is_published BOOLEAN DEFAULT true,
    start_date DATE,
    end_date DATE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar proyectos de ejemplo
INSERT INTO projects (title, slug, description, tech_stack, live_link, repo_link, is_featured, sort_order) VALUES
    (
        'E-Commerce Platform',
        'e-commerce-platform',
        'Plataforma de comercio electrónico completa con carrito de compras, pagos y gestión de inventario.',
        ARRAY['Angular', 'Node.js', 'PostgreSQL', 'Stripe', 'Docker'],
        'https://demo-ecommerce.com',
        'https://github.com/user/ecommerce',
        true,
        1
    ),
    (
        'Task Management App',
        'task-management-app',
        'Aplicación de gestión de tareas con colaboración en tiempo real y notificaciones.',
        ARRAY['React', 'Firebase', 'TypeScript', 'Tailwind CSS'],
        'https://demo-tasks.com',
        'https://github.com/user/tasks',
        true,
        2
    ),
    (
        'Weather Dashboard',
        'weather-dashboard',
        'Dashboard meteorológico con visualizaciones interactivas y pronósticos.',
        ARRAY['Vue.js', 'D3.js', 'OpenWeather API', 'SCSS'],
        'https://demo-weather.com',
        'https://github.com/user/weather',
        false,
        3
    );

-- ============================================
-- TABLA: experiences
-- Experiencia laboral
-- ============================================
CREATE TABLE IF NOT EXISTS experiences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company VARCHAR(200) NOT NULL,
    position VARCHAR(200) NOT NULL,
    description TEXT,
    responsibilities TEXT[] DEFAULT '{}',
    tech_used TEXT[] DEFAULT '{}',
    location VARCHAR(100),
    start_date DATE NOT NULL,
    end_date DATE,
    is_current BOOLEAN DEFAULT false,
    company_logo_url TEXT,
    company_url TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- FUNCIONES Y TRIGGERS
-- ============================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para cada tabla
CREATE TRIGGER update_profile_info_updated_at
    BEFORE UPDATE ON profile_info
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_skills_updated_at
    BEFORE UPDATE ON skills
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_experiences_updated_at
    BEFORE UPDATE ON experiences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE profile_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura pública (SELECT)
CREATE POLICY "Allow public read on profile_info" ON profile_info
    FOR SELECT USING (true);

CREATE POLICY "Allow public read on skills" ON skills
    FOR SELECT USING (true);

CREATE POLICY "Allow public read on published projects" ON projects
    FOR SELECT USING (is_published = true);

CREATE POLICY "Allow public read on experiences" ON experiences
    FOR SELECT USING (true);

-- Políticas de escritura solo para usuarios autenticados
CREATE POLICY "Allow authenticated insert on profile_info" ON profile_info
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update on profile_info" ON profile_info
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated delete on profile_info" ON profile_info
    FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated insert on skills" ON skills
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update on skills" ON skills
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated delete on skills" ON skills
    FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated all on projects" ON projects
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated all on experiences" ON experiences
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================
-- STORAGE BUCKET PARA IMÁGENES
-- ============================================
-- Ejecutar en Supabase Dashboard > Storage > Create bucket
-- Nombre: portfolio-images
-- Public: true

-- Política de Storage (ejecutar en SQL Editor después de crear el bucket)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('portfolio-images', 'portfolio-images', true);

-- CREATE POLICY "Allow public read on portfolio-images" ON storage.objects
--     FOR SELECT USING (bucket_id = 'portfolio-images');

-- CREATE POLICY "Allow authenticated upload on portfolio-images" ON storage.objects
--     FOR INSERT TO authenticated WITH CHECK (bucket_id = 'portfolio-images');

-- CREATE POLICY "Allow authenticated update on portfolio-images" ON storage.objects
--     FOR UPDATE TO authenticated USING (bucket_id = 'portfolio-images');

-- CREATE POLICY "Allow authenticated delete on portfolio-images" ON storage.objects
--     FOR DELETE TO authenticated USING (bucket_id = 'portfolio-images');

-- ============================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- ============================================
CREATE INDEX IF NOT EXISTS idx_skills_category ON skills(category);
CREATE INDEX IF NOT EXISTS idx_skills_featured ON skills(is_featured);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(is_featured);
CREATE INDEX IF NOT EXISTS idx_projects_published ON projects(is_published);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);
