/**
 * api.js - GDG Africa University API Layer
 * Handles all CRUD operations with Supabase
 */

import { supabase } from './supabase-config.js';

// ==========================================
//  BLOG API
// ==========================================
export const BlogAPI = {
  // Get all published posts
  async getPublished() {
    const { data, error } = await supabase
      .from('blog')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false });
    return { data: data || [], error };
  },

  // Get single post
  async getById(id) {
    const { data, error } = await supabase
      .from('blog')
      .select('*')
      .eq('id', id)
      .single();
    return { data, error };
  },

  // Submit new post (pending approval)
  async submit(post) {
    const { data, error } = await supabase
      .from('blog')
      .insert({ ...post, status: 'pending' })
      .select();
    return { data, error };
  },

  // Update post (admin only)
  async update(id, updates) {
    const { data, error } = await supabase
      .from('blog')
      .update(updates)
      .eq('id', id)
      .select();
    return { data, error };
  },

  // Delete post (admin only)
  async delete(id) {
    const { error } = await supabase
      .from('blog')
      .delete()
      .eq('id', id);
    return { error };
  },

  // Approve post (admin only)
  async approve(id) {
    return this.update(id, { status: 'published' });
  },

  // Get pending posts (admin only)
  async getPending() {
    const { data, error } = await supabase
      .from('blog')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    return { data: data || [], error };
  }
};

// ==========================================
//  PROJECTS API
// ==========================================
export const ProjectsAPI = {
  // Get all approved projects
  async getApproved() {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });
    return { data: data || [], error };
  },

  // Get single project
  async getById(id) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();
    return { data, error };
  },

  // Get spotlight project
  async getSpotlight() {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('is_spotlight', true)
      .eq('status', 'approved')
      .limit(1)
      .single();
    return { data, error };
  },

  // Submit new project (pending approval)
  async submit(project) {
    const { data, error } = await supabase
      .from('projects')
      .insert({ ...project, status: 'pending' })
      .select();
    return { data, error };
  },

  // Update project (admin only)
  async update(id, updates) {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select();
    return { data, error };
  },

  // Delete project (admin only)
  async delete(id) {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);
    return { error };
  },

  // Approve project (admin only)
  async approve(id) {
    return this.update(id, { status: 'approved' });
  },

  // Get pending projects (admin only)
  async getPending() {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    return { data: data || [], error };
  },

  // Set spotlight (admin only)
  async setSpotlight(id) {
    // First, remove spotlight from all projects
    await supabase
      .from('projects')
      .update({ is_spotlight: false })
      .eq('is_spotlight', true);
    
    // Then set the new spotlight
    return this.update(id, { is_spotlight: true });
  }
};

// ==========================================
//  TEAM API
// ==========================================
export const TeamAPI = {
  // Get all team members
  async getAll() {
    const { data, error } = await supabase
      .from('team')
      .select('*')
      .order('created_at', { ascending: true });
    return { data: data || [], error };
  },

  // Get single team member
  async getById(id) {
    const { data, error } = await supabase
      .from('team')
      .select('*')
      .eq('id', id)
      .single();
    return { data, error };
  },

  // Get spotlight member
  async getSpotlight() {
    const { data, error } = await supabase
      .from('team')
      .select('*')
      .eq('is_spotlight', true)
      .limit(1)
      .single();
    return { data, error };
  },

  // Add team member (admin only)
  async add(member) {
    const { data, error } = await supabase
      .from('team')
      .insert(member)
      .select();
    return { data, error };
  },

  // Update team member (admin only)
  async update(id, updates) {
    const { data, error } = await supabase
      .from('team')
      .update(updates)
      .eq('id', id)
      .select();
    return { data, error };
  },

  // Delete team member (admin only)
  async delete(id) {
    const { error } = await supabase
      .from('team')
      .delete()
      .eq('id', id);
    return { error };
  },

  // Set spotlight member (admin only)
  async setSpotlight(id) {
    // First, remove spotlight from all members
    await supabase
      .from('team')
      .update({ is_spotlight: false })
      .eq('is_spotlight', true);
    
    // Then set the new spotlight
    return this.update(id, { 
      is_spotlight: true,
      spotlight_date: new Date().toISOString().split('T')[0]
    });
  }
};

// ==========================================
//  EVENTS API
// ==========================================
export const EventsAPI = {
  // Get upcoming events
  async getUpcoming() {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .gte('date', new Date().toISOString().split('T')[0])
      .order('date', { ascending: true });
    return { data: data || [], error };
  },

  // Get all events
  async getAll() {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: false });
    return { data: data || [], error };
  },

  // Get single event
  async getById(id) {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();
    return { data, error };
  },

  // Add event (admin only)
  async add(event) {
    const { data, error } = await supabase
      .from('events')
      .insert(event)
      .select();
    return { data, error };
  },

  // Update event (admin only)
  async update(id, updates) {
    const { data, error } = await supabase
      .from('events')
      .update(updates)
      .eq('id', id)
      .select();
    return { data, error };
  },

  // Delete event (admin only)
  async delete(id) {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);
    return { error };
  }
};

// ==========================================
//  TESTIMONIALS API
// ==========================================
export const TestimonialsAPI = {
  // Get all testimonials
  async getAll() {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .order('created_at', { ascending: false });
    return { data: data || [], error };
  },

  // Get single testimonial
  async getById(id) {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .eq('id', id)
      .single();
    return { data, error };
  },

  // Add testimonial (admin only)
  async add(testimonial) {
    const { data, error } = await supabase
      .from('testimonials')
      .insert(testimonial)
      .select();
    return { data, error };
  },

  // Update testimonial (admin only)
  async update(id, updates) {
    const { data, error } = await supabase
      .from('testimonials')
      .update(updates)
      .eq('id', id)
      .select();
    return { data, error };
  },

  // Delete testimonial (admin only)
  async delete(id) {
    const { error } = await supabase
      .from('testimonials')
      .delete()
      .eq('id', id);
    return { error };
  }
};

// ==========================================
//  NEWSLETTER API
// ==========================================
export const NewsletterAPI = {
  // Subscribe to newsletter
  async subscribe(email) {
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .insert({ email })
      .select();
    return { data, error };
  },

  // Get subscriber count
  async getSubscriberCount() {
    const { count, error } = await supabase
      .from('newsletter_subscribers')
      .select('id', { count: 'exact', head: true });
    return { count: count || 0, error };
  },

  // Get all subscribers (admin only)
  async getAll() {
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .order('created_at', { ascending: false });
    return { data: data || [], error };
  }
};

// ==========================================
//  APPLICATIONS API
// ==========================================
export const ApplicationsAPI = {
  // Submit application
  async submit(application) {
    const { data, error } = await supabase
      .from('applications')
      .insert(application)
      .select();
    return { data, error };
  },

  // Get all applications (admin only)
  async getAll() {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false });
    return { data: data || [], error };
  },

  // Update application status (admin only)
  async updateStatus(id, status) {
    const { data, error } = await supabase
      .from('applications')
      .update({ status })
      .eq('id', id)
      .select();
    return { data, error };
  }
};

// ==========================================
//  MEMBERSHIP APPLICATIONS API
// ==========================================
export const MembershipAPI = {
  // Submit membership application
  async submit(application) {
    const { data, error } = await supabase
      .from('membership_applications')
      .insert({ ...application, status: 'pending' })
      .select();
    return { data, error };
  },

  // Get all applications (admin only)
  async getAll() {
    const { data, error } = await supabase
      .from('membership_applications')
      .select('*')
      .order('created_at', { ascending: false });
    return { data, error };
  },

  // Update application status (admin only)
  async updateStatus(id, status) {
    const { data, error } = await supabase
      .from('membership_applications')
      .update({ status })
      .eq('id', id)
      .select();
    return { data, error };
  }
};

// ==========================================
//  SEMESTER PLAN API
// ==========================================
export const SemesterPlanAPI = {
  // Get all activities
  async getAll() {
    const { data, error } = await supabase
      .from('semester_plan')
      .select('*')
      .order('date', { ascending: true });
    return { data: data || [], error };
  },

  // Get upcoming activities
  async getUpcoming() {
    const { data, error } = await supabase
      .from('semester_plan')
      .select('*')
      .eq('status', 'upcoming')
      .order('date', { ascending: true });
    return { data: data || [], error };
  },

  // Add activity (admin only)
  async add(activity) {
    const { data, error } = await supabase
      .from('semester_plan')
      .insert(activity)
      .select();
    return { data, error };
  },

  // Update activity (admin only)
  async update(id, updates) {
    const { data, error } = await supabase
      .from('semester_plan')
      .update(updates)
      .eq('id', id)
      .select();
    return { data, error };
  },

  // Delete activity (admin only)
  async delete(id) {
    const { error } = await supabase
      .from('semester_plan')
      .delete()
      .eq('id', id);
    return { error };
  }
};

// ==========================================
//  NEWSLETTERS ARCHIVE API
// ==========================================
export const NewslettersArchiveAPI = {
  // Get all newsletters
  async getAll() {
    const { data, error } = await supabase
      .from('newsletters')
      .select('*')
      .order('published_date', { ascending: false });
    return { data: data || [], error };
  },

  // Add newsletter (admin only)
  async add(newsletter) {
    const { data, error } = await supabase
      .from('newsletters')
      .insert(newsletter)
      .select();
    return { data, error };
  },

  // Update newsletter (admin only)
  async update(id, updates) {
    const { data, error } = await supabase
      .from('newsletters')
      .update(updates)
      .eq('id', id)
      .select();
    return { data, error };
  },

  // Delete newsletter (admin only)
  async delete(id) {
    const { error } = await supabase
      .from('newsletters')
      .delete()
      .eq('id', id);
    return { error };
  }
};

// ==========================================
//  AUTH API
// ==========================================
export const AuthAPI = {
  // Sign in
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Get current user
  async getUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  // Check if user is authenticated
  async isAuthenticated() {
    const { user } = await this.getUser();
    return !!user;
  }
};

// ==========================================
//  IMAGE UPLOAD API
// ==========================================
export const ImageAPI = {
  // Upload image to Supabase Storage
  async upload(file, folder = 'general') {
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('gdg-images')
      .upload(fileName, file);
    
    if (error) return { data: null, error };
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('gdg-images')
      .getPublicUrl(fileName);
    
    return { data: { path: fileName, url: publicUrl }, error: null };
  },

  // Delete image
  async delete(path) {
    const { error } = await supabase.storage
      .from('gdg-images')
      .remove([path]);
    return { error };
  },

  // Get public URL
  getUrl(path) {
    const { data: { publicUrl } } = supabase.storage
      .from('gdg-images')
      .getPublicUrl(path);
    return publicUrl;
  }
};

// Export all APIs
export default {
  Blog: BlogAPI,
  Projects: ProjectsAPI,
  Team: TeamAPI,
  Events: EventsAPI,
  Testimonials: TestimonialsAPI,
  Newsletter: NewsletterAPI,
  Applications: ApplicationsAPI,
  Membership: MembershipAPI,
  SemesterPlan: SemesterPlanAPI,
  NewslettersArchive: NewslettersArchiveAPI,
  Auth: AuthAPI,
  Image: ImageAPI
};
