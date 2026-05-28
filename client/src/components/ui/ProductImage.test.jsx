import { render, screen } from '@testing-library/react';
import ProductImage from './ProductImage';

describe('ProductImage', () => {
  it('renders product name as text when no imageUrl', () => {
    render(<ProductImage name="Gummy Bears" className="h-10 w-10" />);
    expect(screen.getByText('Gummy Bears')).toBeInTheDocument();
  });

  it('renders an img element when imageUrl is provided', () => {
    render(<ProductImage name="Gummy Bears" imageUrl="https://example.com/img.jpg" className="h-10 w-10" />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'https://example.com/img.jpg');
    expect(img).toHaveAttribute('alt', 'Gummy Bears');
  });

  it('placeholder color is deterministic for the same name', () => {
    const { container: c1 } = render(<ProductImage name="Gummy Bears" />);
    const { container: c2 } = render(<ProductImage name="Gummy Bears" />);
    expect(c1.firstChild.className).toBe(c2.firstChild.className);
  });

  it('renders placeholder with empty name gracefully', () => {
    render(<ProductImage name="" />);
    // Should render a div (placeholder) without crashing
    const { container } = render(<ProductImage name="" />);
    expect(container.firstChild.tagName).toBe('DIV');
  });

  it('applies className to the img element', () => {
    render(<ProductImage name="Test" imageUrl="https://example.com/img.jpg" className="custom-class" />);
    expect(screen.getByRole('img')).toHaveClass('custom-class');
  });

  it('applies className to the placeholder div', () => {
    const { container } = render(<ProductImage name="Test" className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
