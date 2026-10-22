import { useState } from 'react';
import { ArrowUpRight, Check } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { socials } from '../data/social-links';

const contactSchema = z.object({
  name: z.string().trim().min(1, 'Please enter your name.'),
  email: z.string().trim().email('Please enter a valid email address.'),
  subject: z.string().min(1, 'Choose a subject.'),
  message: z.string().trim().min(1, 'Please add a message.'),
});

type ContactFormValues = z.infer<typeof contactSchema>;

function Contact() {
  const [sent, setSent] = useState(false);
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: '', email: '', subject: '', message: '' },
  });

  function sendNote() {
    setSent(true);
  }

  return (
    <main className="contact-page page-enter" data-testid="page-contact">
      <section className="contact-copy">
        <span className="eyebrow">A note is always welcome</span>
        <h1>Contact</h1>
        <p>For inquiries, commissions, or collaboration opportunities, feel free to send a message. I’d love to hear from you.</p>
        <a href="mailto:inquire@somedaysinmay.com" data-testid="link-contact-email">inquire@somedaysinmay.com</a>
        <div className="contact-socials" aria-label="Studio social links">
          {socials.slice(0, 3).map((social) => (
            <a href={social.url} key={social.name} target="_blank" rel="noreferrer" data-testid={`link-contact-${social.name.toLowerCase()}`}>
              {social.name}<ArrowUpRight size={13} />
            </a>
          ))}
        </div>
        <img className="contact-detail-image" src="/images/under-tow.jpg" alt="Painted texture in soft sea-glass and sand tones" loading="lazy" />
      </section>
      <div className="contact-form-wrap">
        {sent ? (
          <div className="form-success" role="status" data-testid="status-contact-sent">
            <Check size={20} />
            <h2>Thank you for your note.</h2>
            <p>This form is not connected to email delivery just yet. Please write directly to <a href="mailto:inquire@somedaysinmay.com">inquire@somedaysinmay.com</a>.</p>
          </div>
        ) : (
          <Form {...form}>
            <form className="contact-form" onSubmit={form.handleSubmit(sendNote)} data-testid="form-contact">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl><input autoComplete="name" {...field} data-testid="input-contact-name" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl><input type="email" autoComplete="email" {...field} data-testid="input-contact-email" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="subject" render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject *</FormLabel>
                  <FormControl>
                    <select {...field} data-testid="select-contact-subject">
                      <option value="" disabled>Select a subject</option>
                      <option value="artwork">Artwork enquiry</option>
                      <option value="commission">Commission</option>
                      <option value="collaboration">Collaboration</option>
                      <option value="other">Something else</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="message" render={({ field }) => (
                <FormItem>
                  <FormLabel>Message *</FormLabel>
                  <FormControl><textarea rows={5} {...field} data-testid="textarea-contact-message" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <button className="solid-button" type="submit" data-testid="button-send-message">Send Message</button>
              <small>We read every note with care. Form delivery is not connected on this demo site.</small>
            </form>
          </Form>
        )}
      </div>
      <figure className="contact-image-column">
        <img className="contact-side-image" src="/images/room-blue.jpg" alt="A blue textured artwork in a calm studio interior" data-testid="image-contact-studio" />
        <figcaption>Somedays in May · Studio notes</figcaption>
      </figure>
    </main>
  );
}

export default Contact;
