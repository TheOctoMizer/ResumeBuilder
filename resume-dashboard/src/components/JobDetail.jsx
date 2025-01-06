import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Chip, 
  Box, 
  Divider,
  Grid,
  IconButton,
  Button,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Work as WorkIcon,
  LocationOn as LocationIcon,
  AttachMoney as SalaryIcon,
  Description as DescriptionIcon,
  Category as CategoryIcon,
  School as EducationIcon,
  Language as SkillsIcon,
  AccessTime as ExperienceIcon,
  Link as LinkIcon,
  WorkOutline as WorkArrangementIcon,
  Timeline as StatusIcon
} from '@mui/icons-material';
import PropTypes from 'prop-types';

function JobDetail({ job }) {
    if (!job) {
        return null;
    }
  // Helper function to render a detail row
  const renderDetailRow = (icon, label, value, tooltipTitle = '') => (
    <Grid item xs={12} sm={6}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        {icon}
        <Tooltip title={tooltipTitle} placement="top">
          <Typography variant="body2" sx={{ ml: 2 }}>
            <strong>{label}:</strong> {value || 'Not Specified'}
          </Typography>
        </Tooltip>
      </Box>
    </Grid>
  );

  return (
    <Card variant="outlined" sx={{ height: '100%', overflow: 'auto' }}>
      <CardContent>
        <Typography variant="h4" gutterBottom>
          {job.JobTitle || "Job Title Not Available"}
        </Typography>
        <Divider sx={{ mb: 3 }} />

        {/* Company and Basic Info */}
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <WorkIcon sx={{ mr: 1 }} />
                <Typography variant="h6">
                  {job.Company || "Company Not Specified"}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocationIcon sx={{ mr: 1 }} />
                <Typography>
                  {[job.City, job.State, job.Country].filter(Boolean).join(', ') || "Location Not Specified"}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <SalaryIcon sx={{ mr: 1 }} />
                <Typography>
                  {job.Salary || "Salary Not Specified"}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Job Description */}
        {job.Description && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <DescriptionIcon sx={{ mr: 1 }} />
              Description
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {job.Description}
            </Typography>
          </Box>
        )}

        {/* Technical Skills */}
        {job.TechnicalSkills && job.TechnicalSkills.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <SkillsIcon sx={{ mr: 1 }} />
              Technical Skills
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {job.TechnicalSkills.map((skill, index) => (
                <Chip key={index} label={skill} color="primary" variant="outlined" />
              ))}
            </Box>
          </Box>
        )}

        {/* Requirements */}
        {(job.Requirements || job.Education || job.Experience) && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <CategoryIcon sx={{ mr: 1 }} />
              Requirements
            </Typography>
            <Grid container spacing={2}>
              {job.Education && (
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <EducationIcon sx={{ mr: 1 }} />
                    <Typography>
                      <strong>Education:</strong> {job.Education}
                    </Typography>
                  </Box>
                </Grid>
              )}
              {job.Experience && (
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ExperienceIcon sx={{ mr: 1 }} />
                    <Typography>
                      <strong>Experience:</strong> {job.Experience}
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Box>
        )}

        {/* Application Link */}
        {job.ApplicationLink && (
          <Box sx={{ mt: 3 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<LinkIcon />}
              href={job.ApplicationLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              Apply Now
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

JobDetail.propTypes = {
  job: PropTypes.object.isRequired,
  onGenerateDownload: PropTypes.func.isRequired
};

export default JobDetail; 