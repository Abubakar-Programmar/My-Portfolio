<script setup lang="ts">
const site = useSite()
usePageSeo({ title: 'Terms of Service', description: 'The terms that apply when you use this website and engage my services.', breadcrumbs: [{ name: 'Terms of Service', path: '/terms' }] })
</script>

<template>
  <LegalPage title="Terms of Service" updated="October 7, 2026">
    <p>By using this website you agree to these terms. They apply to the website itself; individual projects are governed by a written quote or agreement.</p>

    <h2>Using the website</h2>
    <p>You may browse the site and send enquiries for lawful purposes. Please do not attempt to disrupt the site, probe it for vulnerabilities, or submit spam or abusive content.</p>

    <h2>Services and quotes</h2>
    <p>Descriptions of services on this website are indicative and not binding offers. Scope, price, timelines and payment terms are confirmed in a written quote before work begins.</p>

    <h2>Intellectual property</h2>
    <p>Content on this site, including text, design and case studies, belongs to {{ site.profile.name }} or is used with permission. Client work shown here is displayed with the client’s consent. Ownership of deliverables is transferred to clients as set out in each project agreement.</p>

    <h2>Third-party links</h2>
    <p>The site may link to external websites. I am not responsible for their content or practices.</p>

    <h2>No warranty</h2>
    <p>The website and its content are provided “as is”. I take care to keep information accurate, but I make no guarantees about completeness or fitness for a particular purpose. Case-study results describe specific projects and are not a promise of similar outcomes.</p>

    <h2>Limitation of liability</h2>
    <p>To the extent permitted by law, I am not liable for indirect or consequential losses arising from your use of this website.</p>

    <h2>Contact</h2>
    <p>Questions about these terms? Email <a v-if="site.contact.email" :href="`mailto:${site.contact.email}`">{{ site.contact.email }}</a><template v-else>me through the <NuxtLink to="/contact">contact page</NuxtLink></template>.</p>
  </LegalPage>
</template>
