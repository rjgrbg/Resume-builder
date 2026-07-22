import { Document, Page, Text, View, StyleSheet, renderToBuffer } from '@react-pdf/renderer'
import type { ResumeDocument } from './types'

const styles = StyleSheet.create({
  page: { padding: 36, fontSize: 10, fontFamily: 'Helvetica' },
  name: { fontSize: 18, fontWeight: 700, marginBottom: 2 },
  contactRow: { fontSize: 9, color: '#444', marginBottom: 12 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    marginTop: 12,
    marginBottom: 4,
    textTransform: 'uppercase',
    borderBottomWidth: 1,
    borderBottomColor: '#999',
    paddingBottom: 2,
  },
  entryHeader: { fontSize: 10, fontWeight: 700, marginTop: 6 },
  entrySubHeader: { fontSize: 9, color: '#444', marginBottom: 2 },
  bullet: { fontSize: 9.5, marginLeft: 10, marginBottom: 2 },
  paragraph: { fontSize: 9.5, lineHeight: 1.4 },
  skillsRow: { fontSize: 9.5 },
})

/**
 * Renders a ResumeDocument as a PDF buffer for download (Requirement 7).
 * Every section/field present in the document is included, satisfying the
 * round-trip content preservation requirement (7.2).
 */
export async function renderResumePdf(doc: ResumeDocument): Promise<Buffer> {
  const contactParts = [
    doc.contact.email,
    doc.contact.phone,
    doc.contact.address,
    doc.contact.linkedin,
    doc.contact.website,
  ].filter(Boolean)

  const element = (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.name}>{doc.contact.name}</Text>
        {contactParts.length > 0 && (
          <Text style={styles.contactRow}>{contactParts.join('  |  ')}</Text>
        )}

        {doc.summary && (
          <View>
            <Text style={styles.sectionTitle}>Summary</Text>
            <Text style={styles.paragraph}>{doc.summary}</Text>
          </View>
        )}

        {doc.workExperience && doc.workExperience.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Work Experience</Text>
            {doc.workExperience.map((entry, i) => (
              <View key={i}>
                <Text style={styles.entryHeader}>
                  {entry.title ? `${entry.title} — ${entry.company}` : entry.company}
                </Text>
                {(entry.startDate || entry.endDate || entry.location) && (
                  <Text style={styles.entrySubHeader}>
                    {[entry.startDate, entry.endDate].filter(Boolean).join(' – ')}
                    {entry.location ? `  ${entry.location}` : ''}
                  </Text>
                )}
                {entry.bullets.map((b, j) => (
                  <Text key={j} style={styles.bullet}>
                    • {b}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        )}

        {doc.education && doc.education.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Education</Text>
            {doc.education.map((entry, i) => (
              <View key={i}>
                <Text style={styles.entryHeader}>{entry.institution}</Text>
                {(entry.degree || entry.field || entry.startDate || entry.endDate) && (
                  <Text style={styles.entrySubHeader}>
                    {[entry.degree, entry.field].filter(Boolean).join(', ')}
                    {entry.startDate || entry.endDate
                      ? `  ${[entry.startDate, entry.endDate].filter(Boolean).join(' – ')}`
                      : ''}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {doc.skills && doc.skills.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Skills</Text>
            <Text style={styles.skillsRow}>{doc.skills.join(', ')}</Text>
          </View>
        )}

        {doc.certifications && doc.certifications.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Certifications</Text>
            {doc.certifications.map((cert, i) => (
              <View key={i}>
                <Text style={styles.entryHeader}>{cert.name}</Text>
                {(cert.issuer || cert.date) && (
                  <Text style={styles.entrySubHeader}>
                    {[cert.issuer, cert.date].filter(Boolean).join('  ·  ')}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {doc.references && doc.references.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>References</Text>
            {doc.references.map((ref, i) => (
              <View key={i}>
                <Text style={styles.entryHeader}>{ref.name}</Text>
                {(ref.title || ref.contact) && (
                  <Text style={styles.entrySubHeader}>
                    {[ref.title, ref.contact].filter(Boolean).join('  ·  ')}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  )

  return renderToBuffer(element)
}
