function PageContainer({ as: Tag = 'section', className = '', children, ...rest }) {
  const classes = ['page', className].filter(Boolean).join(' ')
  return (
    <Tag className={classes} {...rest}>
      {children}
    </Tag>
  )
}

export default PageContainer