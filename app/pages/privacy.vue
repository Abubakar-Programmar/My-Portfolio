<script setup lang="ts">
const site = useSite()
usePageSeo({ title: 'Privacy Policy', description: 'How this website collects, uses and protects your information.', breadcrumbs: [{ name: 'Privacy Policy', path: '/privacy' }] })
</script>

<template>
  <LegalPage title="Privacy Policy" updated="October 7, 2026">
    <p>This policy explains what information {{ site.profile.name }} (“I”, “me”) collects through this website, why, and the choices you have.</p>

    <h2>Information I collect</h2>
    <ul>
      <li><strong>Contact form.</strong> When you send a message I receive your name, email address, the service you are interested in, your budget range and your message. I also store the IP address used for the submission to help detect spam.</li>
      <li><strong>Newsletter.</strong> If you subscribe to blog updates I store your email address.</li>
      <li><strong>Anonymous analytics.</strong> I count page views using a first-party system. It records the page path, the referring website, the device type (mobile, tablet or desktop) and, where available, the country. It uses no cookies, does not store your IP address and respects the browser’s Do Not Track setting.</li>
    </ul>

    <h2>How I use it</h2>
    <p>I use your details only to reply to your enquiry, send the updates you asked for, keep the site secure and understand which pages are useful. I do not sell your information or use it for advertising.</p>

    <h2>Email</h2>
    <p>Messages are delivered to me by email and, after you submit the form, you may receive an automatic confirmation. I reply from my own mailbox, so your emails are also subject to my email provider’s policies.</p>

    <h2>Retention</h2>
    <p>Messages are kept for as long as needed to handle your enquiry and any resulting work, then archived or deleted. Newsletter addresses are kept until you unsubscribe.</p>

    <h2>Your rights</h2>
    <p>You can ask to see, correct or delete the personal information I hold about you, or to be removed from the newsletter, at any time by emailing <a v-if="site.contact.email" :href="`mailto:${site.contact.email}`">{{ site.contact.email }}</a><template v-else>me through the <NuxtLink to="/contact">contact page</NuxtLink></template>.</p>

    <h2>Security</h2>
    <p>The site is served over HTTPS, passwords are hashed, and access to stored messages is limited to me. No system is perfectly secure, but I work to protect your data.</p>

    <h2>Changes</h2>
    <p>If I change this policy, I will update the date above.</p>
  </LegalPage>
</template>
