import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { useAuth } from '../firebase/use-auth';
import { createContactInquiry } from '../firebase/store';
import { firebaseConfigured } from '../firebase/firebase';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useLocalization } from '../localization/provider';

const contactSchema = z.object({
  name: z.string().trim().min(1, 'Please enter your name.').max(120),
  email: z.string().trim().email('Please enter a valid email address.').max(254),
  location: z.string().trim().max(150),
  size: z.string().trim().max(150),
  budget: z.string().trim().max(150),
  message: z.string().trim().min(1, 'Please add a message.').max(4000),
});
type ContactFormValues = z.infer<typeof contactSchema>;

function Contact() {
  const { t } = useLocalization();
  const { user, loading } = useAuth();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: (() => {
      try { return JSON.parse(sessionStorage.getItem('somedays-contact-draft') || 'null') || { name: '', email: '', location: '', size: '', budget: '', message: '' }; }
      catch { return { name: '', email: '', location: '', size: '', budget: '', message: '' }; }
    })(),
  });
  useEffect(() => {
    const subscription = form.watch((values) => {
      try { sessionStorage.setItem('somedays-contact-draft', JSON.stringify(values)); } catch { /* Form remains usable without storage. */ }
    });
    return () => subscription.unsubscribe();
  }, [form]);
  useEffect(() => { if (user?.email) form.setValue('email', user.email); }, [user?.email, form]);
  async function submitInquiry(values: ContactFormValues) {
    if (!user?.email) return;
    setError('');
    try {
      await createContactInquiry(user.uid, { ...values, email: user.email });
      try { sessionStorage.removeItem('somedays-contact-draft'); } catch { /* Saved successfully. */ }
      setSent(true);
    } catch {
      setError('Your inquiry could not be saved. Please try again.');
    }
  }
  return (
    <main className="studio-contact page-enter" data-testid="page-contact">
      <h1>{t('Contact')}</h1>
      <div className="studio-contact-intro">
        <p>{t('For available works, commissions, or collaborations, share a little about what you have in mind.')}</p>
        <p>{t('Collectors in Europe, America, Australia and the Philippines are welcome to inquire. Shipping and payment details are confirmed individually.')}</p>
        <p>{t('You’re welcome to include your preferred size, budget, and any references.')} <a href="mailto:inquire@somedaysinmay.com" data-testid="link-contact-email">inquire@somedaysinmay.com</a></p>
      </div>
      <Form {...form}>
        <form className="studio-contact-form" onSubmit={form.handleSubmit(submitInquiry)} data-testid="form-contact">
          <div className="studio-contact-pair">
            <FormField control={form.control} name="name" render={({ field }) => <FormItem>
              <FormLabel className="sr-only">{t('Name *')}</FormLabel>
              <FormControl><input autoComplete="name" required maxLength={120} placeholder={t('Name')} {...field} data-testid="input-contact-name" /></FormControl><FormMessage />
            </FormItem>} />
            <FormField control={form.control} name="email" render={({ field }) => <FormItem>
              <FormLabel className="sr-only">{t('Email *')}</FormLabel>
              <FormControl><input type="email" readOnly={Boolean(user)} autoComplete="email" required maxLength={254} placeholder={t('Email')} {...field} data-testid="input-contact-email" /></FormControl><FormMessage />
            </FormItem>} />
          </div>
          <FormField control={form.control} name="location" render={({ field }) => <FormItem>
            <FormLabel className="sr-only">{t('Country / City')}</FormLabel>
            <FormControl><input autoComplete="address-level2" maxLength={150} placeholder={t('Country / City')} {...field} /></FormControl><FormMessage />
          </FormItem>} />
          <FormField control={form.control} name="size" render={({ field }) => <FormItem>
            <FormLabel className="sr-only">{t('Preferred size')}</FormLabel>
            <FormControl><input maxLength={150} placeholder={t('Preferred size')} {...field} /></FormControl><FormMessage />
          </FormItem>} />
          <FormField control={form.control} name="budget" render={({ field }) => <FormItem>
            <FormLabel className="sr-only">{t('Budget (optional)')}</FormLabel>
            <FormControl><input maxLength={150} placeholder={t('Budget (optional)')} {...field} /></FormControl><FormMessage />
          </FormItem>} />
          <FormField control={form.control} name="message" render={({ field }) => <FormItem>
            <FormLabel className="sr-only">{t('Message *')}</FormLabel>
            <FormControl><textarea required maxLength={4000} rows={8} placeholder={t('Message')} {...field} data-testid="textarea-contact-message" /></FormControl><FormMessage />
          </FormItem>} />
          {!user && <p><Link href="/account" onClick={() => localStorage.setItem('somedays-firebase-return-path', '/contact')}>{t('Sign in to send your inquiry')}</Link>{t('. Your message will be kept on this browser tab.')}</p>}
          {error && <p role="alert">{t(error)}</p>}
          {sent ? <p className="studio-contact-status" role="status">{t('Your inquiry has been saved. The studio will reply by email.')}</p>
            : <button className="solid-button" type="submit" disabled={loading || form.formState.isSubmitting || !user?.email || !firebaseConfigured} data-testid="button-send-message">{t(form.formState.isSubmitting ? 'Sending…' : 'Submit')}</button>}

        </form>
      </Form>
      <p className="studio-contact-note">{t('For collectors, galleries, and collaborators. A conversation starts here.')}</p>
    </main>
  );
}
export default Contact;
