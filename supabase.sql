CREATE TYPE role AS ENUM ('PLAYER', 'ADMIN');
CREATE TYPE challenge_state AS ENUM ('VISIBLE', 'HIDDEN', 'LOCKED');
CREATE TYPE flag_type AS ENUM ('CASE_SENSITIVE', 'CASE_INSENSITIVE');

CREATE TABLE IF NOT EXISTS "User" (
    "id" UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    "username" TEXT UNIQUE NOT NULL,
    "role" role DEFAULT 'PLAYER',
    "score" INTEGER DEFAULT 0,
    "active" BOOLEAN DEFAULT true,
    "hidden" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Team" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT UNIQUE NOT NULL,
    "password" TEXT NOT NULL,
    "score" INTEGER DEFAULT 0,
    "hidden" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "TeamMember" (
    "id" SERIAL PRIMARY KEY,
    "userId" UUID UNIQUE NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "teamId" INTEGER NOT NULL REFERENCES "Team"("id") ON DELETE CASCADE,
    "joinedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "TeamMember_teamId_idx" ON "TeamMember"("teamId");

CREATE TABLE IF NOT EXISTS "Challenge" (
    "id" SERIAL PRIMARY KEY,
    "title" TEXT UNIQUE NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "type" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "maxAttempts" INTEGER DEFAULT 0,
    "state" challenge_state DEFAULT 'VISIBLE',
    "authorId" UUID NOT NULL REFERENCES "User"("id") ON DELETE RESTRICT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Flag" (
    "id" SERIAL PRIMARY KEY,
    "challengeId" INTEGER NOT NULL REFERENCES "Challenge"("id") ON DELETE CASCADE,
    "content" TEXT NOT NULL,
    "type" flag_type DEFAULT 'CASE_SENSITIVE'
);

CREATE TABLE IF NOT EXISTS "Submission" (
    "id" SERIAL PRIMARY KEY,
    "userId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "teamId" INTEGER REFERENCES "Team"("id") ON DELETE CASCADE,
    "challengeId" INTEGER NOT NULL REFERENCES "Challenge"("id") ON DELETE CASCADE,
    "submitted" TEXT NOT NULL,
    "correct" BOOLEAN NOT NULL,
    "submittedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Solve" (
    "id" SERIAL PRIMARY KEY,
    "userId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "teamId" INTEGER REFERENCES "Team"("id") ON DELETE CASCADE,
    "challengeId" INTEGER NOT NULL REFERENCES "Challenge"("id") ON DELETE CASCADE,
    "points" INTEGER NOT NULL,
    "solvedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("userId", "challengeId"),
    UNIQUE("teamId", "challengeId")
);

CREATE TABLE IF NOT EXISTS "Hint" (
    "id" SERIAL PRIMARY KEY,
    "challengeId" INTEGER NOT NULL REFERENCES "Challenge"("id") ON DELETE CASCADE,
    "content" TEXT NOT NULL,
    "cost" INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS "HintUnlock" (
    "id" SERIAL PRIMARY KEY,
    "hintId" INTEGER NOT NULL REFERENCES "Hint"("id") ON DELETE CASCADE,
    "userId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "teamId" INTEGER REFERENCES "Team"("id") ON DELETE CASCADE,
    "unlockedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("hintId", "userId")
);

CREATE TABLE IF NOT EXISTS "File" (
    "id" SERIAL PRIMARY KEY,
    "challengeId" INTEGER NOT NULL REFERENCES "Challenge"("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Config" (
    "key" TEXT PRIMARY KEY,
    "value" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "Settings" (
    "id" INTEGER PRIMARY KEY DEFAULT 1,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "teamSize" INTEGER DEFAULT 1,
    "startTime" TIMESTAMP,
    "endTime" TIMESTAMP,
    "logoURL" TEXT,
    "homeMarkdown" TEXT,
    "isRegistrationOpen" BOOLEAN DEFAULT true,
    "isPaused" BOOLEAN DEFAULT false
);

CREATE INDEX "Challenge_authorId_idx" ON "Challenge"("authorId");
CREATE INDEX "Flag_challengeId_idx" ON "Flag"("challengeId");
CREATE INDEX "Submission_userId_idx" ON "Submission"("userId");
CREATE INDEX "Submission_teamId_idx" ON "Submission"("teamId");
CREATE INDEX "Submission_challengeId_idx" ON "Submission"("challengeId");
CREATE INDEX "Solve_userId_idx" ON "Solve"("userId");
CREATE INDEX "Solve_teamId_idx" ON "Solve"("teamId");
CREATE INDEX "Solve_challengeId_idx" ON "Solve"("challengeId");
CREATE INDEX "Hint_challengeId_idx" ON "Hint"("challengeId");
CREATE INDEX "HintUnlock_hintId_idx" ON "HintUnlock"("hintId");
CREATE INDEX "HintUnlock_userId_idx" ON "HintUnlock"("userId");
CREATE INDEX "HintUnlock_teamId_idx" ON "HintUnlock"("teamId");
CREATE INDEX "File_challengeId_idx" ON "File"("challengeId");

-- Automatically create user profile when signing up via auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public."User" (id, username, role, active, hidden)
    VALUES (new.id, new.email, 'PLAYER', true, false);
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- RLS POLICIES
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Team" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TeamMember" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Challenge" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Flag" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Submission" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Solve" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Hint" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "HintUnlock" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "File" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Settings" ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin(uid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT role = 'ADMIN' FROM public."User" WHERE id = uid;
$$;

CREATE POLICY "Users can view their own profile"
    ON "User" FOR SELECT
    USING (auth.uid() = id OR public.is_admin(auth.uid()));

CREATE POLICY "Users can update their own profile"
    ON "User" FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Teams are viewable by anyone"
    ON "Team" FOR SELECT
    USING (true);

CREATE POLICY "Team members can update their team"
    ON "Team" FOR UPDATE
    USING (EXISTS (SELECT 1 FROM "TeamMember" WHERE "teamId" = id AND "userId" = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM "TeamMember" WHERE "teamId" = id AND "userId" = auth.uid()));

CREATE POLICY "Team members are viewable by anyone"
    ON "TeamMember" FOR SELECT
    USING (true);

CREATE POLICY "Users can join teams"
    ON "TeamMember" FOR INSERT
    WITH CHECK (auth.uid() = "userId");

CREATE POLICY "Authenticated users can view challenges"
    ON "Challenge" FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Authors can update their challenges"
    ON "Challenge" FOR UPDATE
    USING (auth.uid() = "authorId" OR public.is_admin(auth.uid()))
    WITH CHECK (auth.uid() = "authorId" OR public.is_admin(auth.uid()));

CREATE POLICY "Authors and admins can view flags"
    ON "Flag" FOR SELECT
    USING (
        public.is_admin(auth.uid())
        OR auth.uid() = (SELECT "authorId" FROM "Challenge" WHERE id = "challengeId")
    );

CREATE POLICY "Users can view their submissions"
    ON "Submission" FOR SELECT
    USING (auth.uid() = "userId" OR public.is_admin(auth.uid()));

CREATE POLICY "Users can insert submissions"
    ON "Submission" FOR INSERT
    WITH CHECK (auth.uid() = "userId");

CREATE POLICY "Solves are viewable by anyone"
    ON "Solve" FOR SELECT
    USING (true);

CREATE POLICY "Hints are viewable by anyone"
    ON "Hint" FOR SELECT
    USING (true);

CREATE POLICY "Users can view their hint unlocks"
    ON "HintUnlock" FOR SELECT
    USING (auth.uid() = "userId" OR public.is_admin(auth.uid()));

CREATE POLICY "Users can insert hint unlocks"
    ON "HintUnlock" FOR INSERT
    WITH CHECK (auth.uid() = "userId");

CREATE POLICY "Files are viewable by anyone"
    ON "File" FOR SELECT
    USING (true);

CREATE POLICY "Settings are viewable by authenticated users"
    ON "Settings" FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can update settings"
    ON "Settings" FOR UPDATE
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can insert settings"
    ON "Settings" FOR INSERT
    WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can delete settings"
    ON "Settings" FOR DELETE
    USING (public.is_admin(auth.uid()));
